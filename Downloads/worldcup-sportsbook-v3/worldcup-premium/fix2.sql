
-- Fix wrong team names inserted without accents
UPDATE public.teams SET name='Países Baixos' WHERE name='Paises Baixos';
UPDATE public.teams SET name='Bósnia e Herzegovina' WHERE name='Bosnia Herzegovina';
UPDATE public.teams SET name='Curaçau' WHERE name='Curacau';

-- Delete old wrong names that remained (accented, were not caught by ASCII delete)
DELETE FROM public.teams WHERE name IN ('Bósnia', 'Curaçao', 'Tchéquia');

-- Fix match references that still point to old/wrong names
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
