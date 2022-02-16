BEGIN;
DO
$$
  DECLARE
    adornis_id            int := (SELECT id
                                  from account
                                  WHERE username = 'Adornis');
    admin_role_id         int := (SELECT id
                                  from role
                                  WHERE label = 'administrator');
    data_delivery_role_id int := (SELECT id
                                  from role
                                  WHERE label = 'data_delivery');
    faMed_test_id         int := (SELECT id
                                  from project
                                  WHERE name = 'FaMED_test');
    faMed_id              int := (SELECT id
                                  from project
                                  WHERE name = 'FaMED');
  BEGIN
    /*
     %%%%%%%%%%%% account_role_project table
     */
    RAISE NOTICE '-> Nenne Tabelle account_role zu account_role_project um.';
    CREATE TABLE account_role_project
    (
      id              bigserial NOT NULL,
      account_id      bigint    NOT NULL
        CONSTRAINT account_role_project_account_id_fkey REFERENCES account (id),
      role_id         bigint    NOT NULL
        CONSTRAINT account_role_project_role_id_fkey REFERENCES role (id),
      project_id      bigint    NOT NULL
        CONSTRAINT account_role_project_project_id_fkey REFERENCES project (id),
      valid_startdate timestamp without time zone,
      valid_enddate   timestamp without time zone
    );

    ALTER TABLE ONLY account_role_project
      ADD CONSTRAINT account_role_project_id_pkey PRIMARY KEY (id);

    DROP TABLE account_role;

    RAISE NOTICE '-> Füge Gültigungsdauer zu account_role_project hinzu...';

    /*
     %%%%%%%%%%%% file table
     */
    RAISE NOTICE '-> Nenne "mediaitem" Tabelle zu "file" um...';
    ALTER TABLE mediaitem
      RENAME TO file;
    ALTER TABLE mediaitem_id_seq
      RENAME TO file_id_seq;

    /*
     %%%%%%%%%%%% account table
     */
    RAISE NOTICE '-> Füge role_id zur account Tabelle hinzu...';
    ALTER TABLE account
      ADD COLUMN IF NOT EXISTS role_id integer
        CONSTRAINT account_id_fkey REFERENCES role (id);
    RAISE NOTICE '-> Füge last_login zur account Tabelle hinzu...';
    ALTER TABLE account
      ADD COLUMN IF NOT EXISTS last_login timestamp without time zone;

    /*
    %%%%%%%%%%%% role table
    */
    RAISE NOTICE '-> Füge Spalte "scope" zu role Tabelle hinzu und setze die scopes...';
    ALTER TABLE role
      ADD COLUMN IF NOT EXISTS scope TEXT;
    UPDATE role SET scope='project';
    UPDATE role SET scope='general' WHERE label = 'administrator';
    INSERT INTO role(label, description, scope) VALUES ('user', 'Default role of a registered person', 'general');

    RAISE NOTICE '-> Setze alle ungesetzten role_ids auf die ID der User Rolle...';
    UPDATE account SET role_id = (SELECT id from role where label = 'user') WHERE role_id IS NULL;

    RAISE NOTICE '-> Setze role_id von account auf NOT NULL...';
    ALTER TABLE account
      ALTER COLUMN role_id SET NOT NULL;

    RAISE NOTICE '-> Weise Christoph und Julian Administrator Rollen zu...';
    UPDATE account SET role_id=admin_role_id WHERE username = 'draxler_test' OR username = 'Julian Marius Pömp';
    ALTER TABLE role
      ALTER COLUMN scope SET NOT NULL;

    RAISE NOTICE '';
    RAISE NOTICE '-> Entferne admin_id aus project Tabelle...';
    ALTER TABLE project
      DROP column IF EXISTS admin_id;

    RAISE NOTICE '-> Entferne alle Einträge aus account_role...';
    DELETE from account_role_project;

    RAISE NOTICE '-> Füge project_id zu account_role Tabelle hinzu...';
    ALTER TABLE account_role_project
      ADD COLUMN IF NOT EXISTS project_id bigint
        CONSTRAINT account_project_id_fkey REFERENCES project (id);

    RAISE NOTICE '-> Füge Adornis als data_delivery zu ihren Projekten hinzu...';
    IF adornis_id IS NULL THEN
      RAISE NOTICE 'Adornis Account wurde nicht gefunden, Vorgang übersprungen.';
    ELSIF faMed_test_id IS NULL OR faMed_id IS NULL THEN
      RAISE EXCEPTION 'Projekt IDs für FaMED wurden nicht gefunden.';
    ELSE
      INSERT INTO account_role_project(account_id, role_id, project_id)
      VALUES (adornis_id, data_delivery_role_id, faMed_test_id);
      INSERT INTO account_role_project(account_id, role_id, project_id)
      VALUES (adornis_id, data_delivery_role_id, faMed_id);
    END IF;


    RAISE NOTICE '-> Füge Spalte original_name zur file Tabelle hinzu...';
    RAISE NOTICE '-> Ändere Typ von file.metadata auf json';
    ALTER TABLE file
      ADD COLUMN IF NOT EXISTS original_name text,
      DROP COLUMN metadata,
      ADD COLUMN metadata                    jsonb;

    RAISE NOTICE '-> Erstelle Tabelle file_project...';
    CREATE TABLE file_project
    (
      id         bigserial NOT NULL,
      file_id    bigint    NOT NULL,
      project_id bigint    NOT NULL
    );

    ALTER TABLE ONLY file_project
      ADD CONSTRAINT file_project_id_pkey PRIMARY KEY (id);

    ALTER TABLE ONLY public.file_project
      ADD CONSTRAINT file_project_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.file (id);

    ALTER TABLE ONLY public.file_project
      ADD CONSTRAINT file_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project (id);

    RAISE NOTICE '-> Füge Spalte virtual_folder_path zur file_project Tabelle hinzu...';
    ALTER TABLE file_project
      ADD COLUMN IF NOT EXISTS virtual_folder_path text;
    RAISE NOTICE '-> Füge Spalte virtual_filename zur file_project Tabelle hinzu...';
    ALTER TABLE file_project
      ADD COLUMN IF NOT EXISTS virtual_filename text;

    /*
     %%%%%%%%%%%% all
     */

    RAISE NOTICE '-> Ändere IDs zu bigint um...';
    ALTER TABLE account
      ALTER id TYPE bigint;
    ALTER TABLE account_role_project
      ALTER account_id TYPE bigint,
      ALTER role_id TYPE bigint;
    ALTER TABLE apptoken
      ALTER id TYPE bigint;
    ALTER TABLE file
      ALTER id TYPE bigint,
      ALTER size TYPE bigint;
    ALTER TABLE option
      RENAME TO option_old;
    CREATE TABLE option
    (
      id    bigserial NOT NULL,
      name  text      NOT NULL UNIQUE,
      value text
    );

    ALTER TABLE ONLY option
      ADD CONSTRAINT option_id_pkey PRIMARY KEY (id);

    DROP TABLE option_old;
    ALTER TABLE project
      ALTER id TYPE bigint;
    ALTER TABLE transcript
      ALTER id TYPE bigint,
      ALTER transcriber_id TYPE bigint,
      ALTER project_id TYPE bigint,
      ALTER mediaitem_id TYPE bigint,
      ALTER nexttranscript_id TYPE bigint;

    RAISE NOTICE '-> Ändere mediaitem_id Spalten zu file_id um...';
    ALTER TABLE transcript
      RENAME mediaitem_id TO file_id;
    ALTER TABLE transcript
      RENAME CONSTRAINT transcription_mediaitem_id_fkey TO transcription_file_id_fkey;
  END;
$$;
COMMIT;
