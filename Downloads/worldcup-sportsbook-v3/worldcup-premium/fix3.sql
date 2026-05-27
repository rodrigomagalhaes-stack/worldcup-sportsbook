BEGIN;
INSERT INTO public.teams (name, flag_code) VALUES
  ('Países Baixos','nl'),
  ('Bósnia e Herzegovina','ba'),
  ('Curaçau','cw')
ON CONFLICT (name) DO NOTHING;
UPDATE public.matches SET home='Países Baixos' WHERE home IN ('Paises Baixos','Holanda');
UPDATE public.matches SET away='Países Baixos' WHERE away IN ('Paises Baixos','Holanda');
UPDATE public.matches SET home='Bósnia e Herzegovina' WHERE home IN ('Bosnia Herzegovina','Bósnia');
UPDATE public.matches SET away='Bósnia e Herzegovina' WHERE away IN ('Bosnia Herzegovina','Bósnia');
UPDATE public.matches SET home='Curaçau' WHERE home IN ('Curacau','Curaçao');
UPDATE public.matches SET away='Curaçau' WHERE away IN ('Curacau','Curaçao');
UPDATE public.matches SET home='Republica Tcheca' WHERE home='Tchéquia';
UPDATE public.matches SET away='Republica Tcheca' WHERE away='Tchéquia';
UPDATE public.matches SET home='R. D. Congo' WHERE home='Rep. Congo';
UPDATE public.matches SET away='R. D. Congo' WHERE away='Rep. Congo';
DELETE FROM public.teams WHERE name IN ('Holanda','Rep. Congo','Bósnia','Tchéquia','Curaçao','Paises Baixos','Bosnia Herzegovina','Curacau');
COMMIT;
