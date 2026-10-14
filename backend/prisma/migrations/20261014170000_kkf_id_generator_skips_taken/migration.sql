-- Staff may now type a KKF ID by hand, so the generator must skip numbers that are already taken.
CREATE OR REPLACE FUNCTION kkf_next_id() RETURNS text LANGUAGE plpgsql VOLATILE AS $$
DECLARE
  n bigint;
  v text;
BEGIN
  LOOP
    n := nextval('fighter_kkf_seq');
    v := 'KKF-' || lpad(n::text, greatest(6, length(n::text)), '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM fighters WHERE kkf_id = v);
  END LOOP;
  RETURN v;
END
$$;
