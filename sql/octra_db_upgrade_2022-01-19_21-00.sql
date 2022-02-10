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
    RAISE NOTICE '-> Füge role_id zur account Tabelle hinzu...';
    ALTER TABLE account
      ADD COLUMN IF NOT EXISTS role_id integer
        CONSTRAINT account_id_fkey REFERENCES role (id);

    RAISE NOTICE '-> Füge last_login zur account Tabelle hinzu...';
    ALTER TABLE account
      ADD COLUMN IF NOT EXISTS last_login timestamp without time zone;

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
    DELETE from account_role;

    RAISE NOTICE '-> Füge project_id zu account_role Tabelle hinzu...';
    ALTER TABLE account_role
      ADD COLUMN IF NOT EXISTS project_id INT
        CONSTRAINT account_project_id_fkey REFERENCES project (id);

    RAISE NOTICE '-> Füge Adornis als data_delivery zu ihren Projekten hinzu...';
    IF adornis_id IS NULL THEN
      RAISE NOTICE 'Adornis Account wurde nicht gefunden, Vorgang übersprungen.';
    ELSIF faMed_test_id IS NULL OR faMed_id IS NULL THEN
      RAISE EXCEPTION 'Projekt IDs für FaMED wurden nicht gefunden.';
    ELSE
      INSERT INTO account_role(account_id, role_id, project_id)
      VALUES (adornis_id, data_delivery_role_id, faMed_test_id);
      INSERT INTO account_role(account_id, role_id, project_id) VALUES (adornis_id, data_delivery_role_id, faMed_id);
    END IF;

    RAISE NOTICE '-> Nenne Tabelle account_role zu account_role_project um.';
    ALTER TABLE account_role
      RENAME TO account_role_project;

    RAISE NOTICE '-> Füge Spalte session zur mediaitem Tabelle hinzu...';
    ALTER TABLE mediaitem
      ADD COLUMN IF NOT EXISTS session text NOT NULL DEFAULT 'unknown_session';
    RAISE NOTICE '-> Füge Spalte originalname zur mediaitem Tabelle hinzu...';
    ALTER TABLE mediaitem
      ADD COLUMN IF NOT EXISTS originalname text NOT NULL DEFAULT '';
    RAISE NOTICE '-> Ändere Typ von mediaitem.metadata auf json';
    ALTER TABLE mediaitem
      DROP COLUMN metadata;
    ALTER TABLE mediaitem
      ADD COLUMN metadata jsonb;

    RAISE NOTICE '-> Erstelle Tabelle mediaitem_project...';
    CREATE TABLE mediaitem_project
    (
      mediaitem_id integer NOT NULL,
      project_id   integer NOT NULL
    );

    ALTER TABLE ONLY public.mediaitem_project
      ADD CONSTRAINT mediaitem_project_mediaitem_id_fkey FOREIGN KEY (mediaitem_id) REFERENCES public.mediaitem (id);

    ALTER TABLE ONLY public.mediaitem_project
      ADD CONSTRAINT mediaitem_project_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project (id);

    RAISE NOTICE '-> Füge Gültigungsdauer zu account_role_project hinzu...';
    ALTER TABLE account_role_project
      ADD COLUMN valid_startdate timestamp without time zone;
    ALTER TABLE account_role_project
      ADD COLUMN valid_enddate timestamp without time zone;
  END;
$$;
COMMIT;
