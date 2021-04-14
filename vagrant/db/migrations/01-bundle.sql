/* vagrant/db/migrations/01-bundle.sql */

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.create_table_products()
RETURNS void AS $$
BEGIN
	IF NOT EXISTS (SELECT tablename from pg_catalog.pg_tables WHERE tablename = 'products' and schemaname = 'public') THEN
		CREATE TABLE public.products (
			productId SERIAL PRIMARY KEY,
			productName VARCHAR(255) NOT NULL,
			quantity INTEGER NOT NULL,
			price NUMERIC(5,2)
		);

		ALTER TABLE public.products OWNER TO postgres;

		GRANT SELECT ON public.products TO expressif;

		RAISE NOTICE 'Created table public.products';

	ELSE
		RAISE NOTICE 'Table public.products already exists.';
	END IF;

END;
$$ LANGUAGE plpgsql;


SELECT pg_temp.create_table_products();
DROP FUNCTION pg_temp.create_table_products();


CREATE OR REPLACE FUNCTION pg_temp.create_product_upsert_type()
RETURNS void AS $$
BEGIN
	BEGIN
		IF EXISTS (
			WITH ns AS (
				SELECT oid FROM pg_namespace where nspname::text = 'public'
			) SELECT 1 FROM pg_type INNER JOIN ns ON ns.oid = pg_type.typnamespace AND pg_type.typname::text = 'product_upsert'
		) THEN
			RAISE NOTICE 'Type public.product_upsert already exists.';
		ELSE
			CREATE TYPE public.product_upsert AS (
				productName VARCHAR(255),
				quantity INTEGER,
				price NUMERIC(5,2)
			);
			RAISE NOTICE 'Successfully created type public.product_upsert';
		END IF;
	END;
END;
$$ LANGUAGE plpgsql;

SELECT pg_temp.create_product_upsert_type();
DROP FUNCTION pg_temp.create_product_upsert_type();

DROP FUNCTION IF EXISTS public.post_product(product_upsert);
CREATE OR REPLACE FUNCTION public.post_product
(
	Pproduct product_upsert
)
RETURNS TABLE(
	productId BIGINT
)
AS $$
BEGIN
	RETURN QUERY
	INSERT INTO public.products
	(
		productName,
		quantity,
		price
	)
	VALUES (
		(Pproduct).productName,
		(Pproduct).quantity,
		(Pproduct).price
	) RETURNING products.productId::bigint;
END;
$$
LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;

ALTER FUNCTION public.post_product(
	product_upsert
) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.post_product(
	product_upsert
)TO expressif;

GRANT EXECUTE ON FUNCTION public.post_product(
	product_upsert
)TO PUBLIC;

DROP FUNCTION IF EXISTS public.get_product(INT8);
CREATE OR REPLACE FUNCTION public.get_product ( PproductId INT8 )
RETURNS SETOF public.products
AS $$
BEGIN
	RETURN QUERY
		SELECT *
		FROM public.products
		WHERE productId = PproductId;
END;
$$
LANGUAGE PLPGSQL VOLATILE SECURITY DEFINER;

ALTER FUNCTION public.get_product(
  INT8
) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_product(
  INT8
) TO expressif;


COMMIT;

/*
Examples:
select * from public.post_product(('p1', 10 , 5.5)::product_upsert);
select * from public.get_product(1::bigint);

*/
