-- ============================================================
-- Durcissement RLS — Les Potiers de Tanou-Sakassou
-- Date : 2026-10-04
--
-- NE PAS EXÉCUTER sans validation. À lancer en une fois dans le
-- SQL Editor de Supabase (le tout est dans une transaction : si
-- une instruction échoue, rien n'est appliqué).
--
-- Contexte : toutes les écritures (checkout, admin) passent par le
-- navigateur avec la clé anon + la session de l'utilisateur. Les
-- policies RLS sont donc la seule vraie barrière de sécurité.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0. Fonction utilitaire current_user_role()
-- ------------------------------------------------------------
-- Elle est SECURITY DEFINER (elle lit profiles en contournant la
-- RLS). Sans search_path figé, un objet "profiles" créé dans un
-- autre schéma pourrait être lu à la place du vrai. On fige le
-- search_path : comportement identique, mais plus de détournement.
ALTER FUNCTION public.current_user_role() SET search_path = public;


-- ------------------------------------------------------------
-- 1. ORDERS — création de commande (CRITIQUE)
-- ------------------------------------------------------------

-- 1a. Niveau 2 : trigger qui recalcule la commande côté base.
-- Le navigateur envoie items[] et total_amount, mais on ne lui fait
-- plus confiance : pour chaque ligne, le prix, le nom du produit et
-- le nom du potier sont relus dans la table products, le sous-total
-- et le total sont recalculés, et le statut est forcé à 'pending'.
-- Un produit inconnu ou archivé, ou une quantité invalide, fait
-- échouer la commande.
--
-- Frais de port : même règle que app/checkout/page.tsx
-- (SHIPPING_THRESHOLD = 150, SHIPPING_COST = 12.9). Si cette règle
-- change dans le code, il faut la changer ici aussi.
--
-- SECURITY DEFINER : le trigger lit products quels que soient les
-- droits de l'appelant (visiteur anonyme compris).
CREATE OR REPLACE FUNCTION public.orders_enforce_server_values()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item      jsonb;
  v_items     jsonb := '[]'::jsonb;
  v_qty       integer;
  v_product   record;
  v_subtotal  numeric := 0;
  v_shipping  numeric;
BEGIN
  IF NEW.items IS NULL
     OR jsonb_typeof(NEW.items) <> 'array'
     OR jsonb_array_length(NEW.items) = 0 THEN
    RAISE EXCEPTION 'Commande vide' USING ERRCODE = '22023';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    BEGIN
      v_qty := (v_item ->> 'quantity')::integer;
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Quantité invalide' USING ERRCODE = '22023';
    END;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 100 THEN
      RAISE EXCEPTION 'Quantité invalide' USING ERRCODE = '22023';
    END IF;

    SELECT p.price, p.name, p.artisan_name
      INTO v_product
      FROM public.products p
     WHERE p.id = v_item ->> 'product_id'
       AND p.is_archived = false;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit indisponible' USING ERRCODE = '22023';
    END IF;

    v_items := v_items || jsonb_build_array(
      v_item || jsonb_build_object(
        'quantity',     v_qty,
        'unit_price',   v_product.price,
        'subtotal',     v_product.price * v_qty,
        'product_name', v_product.name,
        'artisan_name', v_product.artisan_name
      )
    );
    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_shipping := CASE WHEN v_subtotal >= 150 THEN 0 ELSE 12.9 END;

  NEW.items        := v_items;
  NEW.total_amount := v_subtotal + v_shipping;
  NEW.status       := 'pending';
  NEW.created_at   := now();
  NEW.updated_at   := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_enforce_server_values ON public.orders;
CREATE TRIGGER orders_enforce_server_values
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_enforce_server_values();

-- 1b. Niveau 1 : la policy INSERT exige aussi status = 'pending'.
-- Le trigger le force déjà (les triggers BEFORE passent avant la
-- vérification RLS), mais on le garde dans la policy par sécurité :
-- si le trigger est un jour supprimé, la protection reste.
-- Commande sans compte toujours possible (user_id NULL) ; un client
-- connecté ne peut rattacher la commande qu'à son propre compte.
DROP POLICY IF EXISTS "Customers can create orders" ON public.orders;
CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND (user_id IS NULL OR user_id = auth.uid())
  );


-- ------------------------------------------------------------
-- 2. ORDERS — lecture par email (CRITIQUE si la confirmation
--    d'email est désactivée)
-- ------------------------------------------------------------
-- auth.email() est l'email du compte connecté, pas forcément un email
-- vérifié. Créer un compte avec l'email d'un client permettrait de lire
-- ses commandes (nom, adresse, téléphone). Le code n'utilise pas cette
-- policy : la page de confirmation lit sessionStorage, et les clients
-- connectés voient leurs commandes via "Users can view own orders"
-- (user_id = auth.uid()), qui reste en place.
DROP POLICY IF EXISTS "Users can view orders by email" ON public.orders;


-- ------------------------------------------------------------
-- 3. PRODUCTS — masquer les produits archivés (À RESTREINDRE)
-- ------------------------------------------------------------
-- Colonne vérifiée dans le code : products.is_archived (boolean).
-- Visiteurs et clients : seulement les produits non archivés.
-- Admin : tout, pour pouvoir lister et désarchiver dans /admin/produits.
-- Les policies admin INSERT / UPDATE / DELETE existantes ne changent pas.
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Products: public non archived, admin all"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_archived = false OR public.current_user_role() = 'admin');


-- ------------------------------------------------------------
-- 4. ARTISANS — écriture admin manquante
-- ------------------------------------------------------------
-- Aujourd'hui seule la lecture publique existe : un UPDATE depuis
-- /admin/potiers ne touche aucune ligne et ne renvoie pas d'erreur,
-- et un INSERT est refusé. On ajoute les droits admin, sur le même
-- modèle que products.
-- La lecture publique ("Public artisans are viewable by everyone")
-- reste inchangée.
DROP POLICY IF EXISTS "Admin can insert artisans" ON public.artisans;
CREATE POLICY "Admin can insert artisans"
  ON public.artisans FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can update artisans" ON public.artisans;
CREATE POLICY "Admin can update artisans"
  ON public.artisans FOR UPDATE
  TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admin can delete artisans" ON public.artisans;
CREATE POLICY "Admin can delete artisans"
  ON public.artisans FOR DELETE
  TO authenticated
  USING (public.current_user_role() = 'admin');


-- ------------------------------------------------------------
-- 5. PROFILES — limiter ce qu'un client peut modifier sur sa ligne
-- ------------------------------------------------------------
-- Côté client, le code ne modifie que first_name et last_name
-- (app/compte/profil/page.tsx, app/inscription/page.tsx). L'admin
-- modifie role (app/admin/utilisateurs/page.tsx).
--
-- Une policy RLS ne peut pas comparer l'ancienne et la nouvelle
-- valeur d'une colonne. On utilise donc un trigger : si l'appelant
-- n'est pas admin, toute modification d'une autre colonne que
-- first_name / last_name / updated_at est refusée (role, email,
-- artisan_id, id, created_at, et toute colonne ajoutée plus tard).
--
-- auth.uid() IS NULL : SQL Editor, clé service_role, triggers
-- internes (ex. handle_new_user). Ils ne sont pas concernés, et un
-- visiteur anonyme est de toute façon bloqué par la policy UPDATE.
CREATE OR REPLACE FUNCTION public.profiles_guard_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() = 'admin' THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - 'first_name' - 'last_name' - 'updated_at')
     IS DISTINCT FROM
     (to_jsonb(OLD) - 'first_name' - 'last_name' - 'updated_at') THEN
    RAISE EXCEPTION 'Seuls le prénom et le nom peuvent être modifiés'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_columns ON public.profiles;
CREATE TRIGGER profiles_guard_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_columns();

-- La policy UPDATE existante ("Profiles: own non-role update or admin
-- all") reste en place : elle limite déjà chaque client à sa propre
-- ligne et l'empêche de changer son rôle.

COMMIT;


-- ============================================================
-- Rien à changer (vérifié)
-- ------------------------------------------------------------
-- cart_items     : ALL limité à auth.uid() = user_id.
-- categories     : lecture publique, écriture admin.
-- site_settings  : lecture publique, écriture admin.
-- storage.objects (bucket product-images) : lecture publique,
--                  INSERT / UPDATE / DELETE réservés à l'admin.
--
-- ROLLBACK (si besoin, à lancer manuellement) :
--   DROP TRIGGER IF EXISTS orders_enforce_server_values ON public.orders;
--   DROP FUNCTION IF EXISTS public.orders_enforce_server_values();
--   DROP TRIGGER IF EXISTS profiles_guard_columns ON public.profiles;
--   DROP FUNCTION IF EXISTS public.profiles_guard_columns();
--   DROP POLICY IF EXISTS "Products: public non archived, admin all" ON public.products;
--   CREATE POLICY "Public products are viewable by everyone"
--     ON public.products FOR SELECT USING (true);
--   (les autres changements ne retirent aucun droit nécessaire au site)
-- ============================================================
