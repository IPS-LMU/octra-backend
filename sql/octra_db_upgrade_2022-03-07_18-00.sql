CREATE OR REPLACE FUNCTION octra_trigger_set_updated_timestamp()
  RETURNS TRIGGER AS
$$
BEGIN
  NEW.updatedate = NOW()::timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

    RAISE NOTICE '-> Füge uploader_id zu file hinzu...';
    ALTER TABLE file
      ADD COLUMN uploader_id bigint;

    ALTER TABLE file
      ADD CONSTRAINT file_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES account (id);

    /*
     %%%%%%%%%%%% account person table
     */
    RAISE NOTICE '-> Create account person...';
    CREATE TABLE account_person
    (
      id           bigserial NOT NULL,
      username     text      NOT NULL,
      email        text,
      loginmethod  text      NOT NULL,
      hash         text      NOT NULL,
      active       bool      NOT NULL          DEFAULT false,
      creationdate timestamp without time zone default now(),
      updatedate   timestamp without time zone DEFAULT NOW()
    );

    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON account_person
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE ONLY account_person
      ADD CONSTRAINT account_person_id_pkey PRIMARY KEY (id);


    /*
     %%%%%%%%%%%% account table
     */

    RAISE NOTICE '-> Füge role_id zur account Tabelle hinzu...';
    RAISE NOTICE '-> Füge last_login zur account Tabelle hinzu...';
    RAISE NOTICE '-> Füge account_person_id zur account Tabelle hinzu...';
    ALTER TABLE account
      ADD COLUMN IF NOT EXISTS account_person_id bigint
        CONSTRAINT account_person_id_fkey REFERENCES account_person (id) on delete set null,
      ADD COLUMN IF NOT EXISTS role_id           bigint
        CONSTRAINT account_role_id_fkey2 REFERENCES role (id),
      ADD COLUMN IF NOT EXISTS last_login        timestamp without time zone;

    RAISE NOTICE '-> Persönliche Daten von account nach account_person verschieben und verknüpfen...';

    DECLARE
      account_id  bigint;
      username    text;
      email       text;
      loginmethod text;
      hash        text;
      active      bool;
    BEGIN
      FOR account_id, username, email, loginmethod, hash, active IN
        SELECT a.id as account_id, a.username, a.email, a.loginmethod, a.hash, a.active
        FROM account a
        order by id
        LOOP
          INSERT INTO account_person(username, email, loginmethod, hash, active)
          values (username, email, loginmethod, hash, active);
          UPDATE account SET account_person_id=lastval() WHERE id = account_id;
        END LOOP;
    END;

    RAISE NOTICE '-> Entferne nicht mehr benötigte Spalten...';
    ALTER TABLE account
      DROP COLUMN username,
      DROP COLUMN email,
      DROP COLUMN createdate,
      DROP COLUMN active,
      DROP COLUMN loginmethod,
      DROP COLUMN hash,
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();

    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON account
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE account
      ALTER id TYPE bigint;

    CREATE OR REPLACE VIEW account_all AS
    (
    SELECT a.id    as id,
           p.id    as person_id,
           p.username,
           p.email,
           p.loginmethod,
           p.hash,
           p.active,
           a.training,
           a.comment,
           r.label as role,
           a.creationdate,
           a.updatedate
    FROM account as a
           FULL OUTER JOIN account_person p ON a.account_person_id = p.id
           INNER JOIN role r ON a.role_id = r.id
    order by a.id
      );
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

    /* TODO ids auslesen und datensätze dort ändern, wo ids zutreffen */
    RAISE NOTICE '-> Weise Christoph und Julian Administrator Rollen zu...';
    DECLARE
      account_id bigint;
      username   text;
    BEGIN
      FOR account_id, username IN
        SELECT a.id as account_id, a.username
        FROM account_all a
        WHERE a.username = 'draxler_test'
           OR a.username = 'Julian Marius Pömp'
           OR a.username = 'Julian'
        LOOP
          UPDATE account SET role_id=admin_role_id WHERE id = account_id;
        END LOOP;
    END;

    ALTER TABLE role
      ALTER COLUMN scope SET NOT NULL;

    RAISE NOTICE '';
    RAISE NOTICE '-> Entferne admin_id aus project Tabelle und konvertiere configuration zu JSONB...';
    ALTER TABLE project
      DROP column IF EXISTS admin_id,
      ADD COLUMN IF NOT EXISTS visibility text,
      ALTER column configuration TYPE json USING configuration::json;

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
      ADD COLUMN IF NOT EXISTS hash          text UNIQUE,
      DROP COLUMN metadata,
      ADD COLUMN metadata                    jsonb;

    RAISE NOTICE '-> Erstelle Tabelle file_project...';
    CREATE TABLE file_project
    (
      id         bigserial NOT NULL,
      file_id    bigint    NOT NULL,
      project_id bigint
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
      ALTER transcript TYPE json USING transcript::json,
      ALTER log TYPE json USING log::json,
      ADD COLUMN admin_comment text,
      ALTER nexttranscript_id TYPE bigint;

    RAISE NOTICE '-> Ändere mediaitem_id Spalten zu file_id um...';
    ALTER TABLE transcript
      RENAME mediaitem_id TO file_id;
    UPDATE transcript set file_id=null;
    ALTER TABLE transcript
      DROP CONSTRAINT transcription_mediaitem_id_fkey,
      ADD CONSTRAINT transcription_file_id_fkey FOREIGN KEY (file_id) REFERENCES file_project (id);

    RAISE NOTICE '-> Füge zu allen Tabellen die Spalten creationdate und updatedate hinzu...';
    ALTER TABLE file_project
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON file_project
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE project
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON project
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE account_role_project
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON account_role_project
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE apptoken
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON apptoken
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE option
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON option
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE role
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON role
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE transcript
      DROP COLUMN creationdate,
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON transcript
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE tool
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON tool
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    ALTER TABLE file
      ADD COLUMN creationdate timestamp without time zone DEFAULT NOW(),
      ADD COLUMN updatedate   timestamp without time zone DEFAULT NOW();
    CREATE TRIGGER octra_set_timestamp
      BEFORE UPDATE
      ON file
      FOR EACH ROW
    EXECUTE PROCEDURE octra_trigger_set_updated_timestamp();

    RAISE NOTICE '-> Ändere project active Default auf false...';
    alter table project
      alter column active set default false;

    CREATE OR REPLACE VIEW project_file_all AS
    (
    select fp.id,
           fp.file_id,
           fp.project_id,
           fp.virtual_filename    as filename,
           fp.virtual_folder_path as path,
           f.url,
           f.type,
           f.size,
           f.original_name,
           f.metadata,
           f.uploader_id,
           fp.creationdate,
           fp.updatedate
    from file_project fp
           left join file f on fp.file_id = f.id
      );

    ALTER TABLE transcript
      RENAME TO task;
    ALTER TABLE task
      DROP COLUMN transcript,
      DROP COLUMN transcriber_id,
      ADD COLUMN worker_id   BIGINT
        CONSTRAINT task_worker_id_fkey REFERENCES account (id),
      DROP COLUMN nexttranscript_id,
      DROP COLUMN file_id,
      ADD COLUMN nexttask_id BIGINT
        CONSTRAINT task_nexttask_id_fkey REFERENCES task (id),
      ADD COLUMN type        text;

    CREATE TABLE task_input_output
    (
      id              bigserial NOT NULL,
      task_id         bigint    NOT NULL
        CONSTRAINT task_input_output_task_id_fkey REFERENCES task (id),
      file_project_id bigint
        CONSTRAINT task_input_output_file_project_id_fkey REFERENCES file_project (id),
      type            text      NOT NULL,
      creator_type    text      NOT NULL,
      label           text      NOT NULL,
      description     text,
      filename        text,
      url             text,
      content         JSON
    );
    ALTER TABLE task_input_output
      ADD CONSTRAINT task_input_output_id_pkey PRIMARY KEY (id);

    CREATE OR REPLACE VIEW task_all AS
    (
    select t.*,
           json_agg(
             json_strip_nulls(
               case
                 when tio.type = 'input'
                   then (case
                           when tio.file_project_id is null
                             then json_build_object('url', tio.url, 'type', tio.type, 'filename', tio.filename, 'label',
                                                    tio.label, 'creator_type', tio.creator_type, 'description',
                                                    tio.description, 'content', tio.content)::JSON
                           else json_build_object('url', fp.url, 'type', fp.type, 'filename', fp.filename, 'label',
                                                  tio.label, 'creator_type', tio.creator_type, 'description',
                                                  tio.description, 'metadata', fp.metadata)::JSON
                   end)
                 else '{}'
                 end)) as inputs,
           json_agg(
             json_strip_nulls(
               case
                 when tio.type = 'output'
                   then (case
                           when tio.file_project_id is null
                             then json_build_object('url', tio.url, 'type', tio.type, 'filename', tio.filename, 'label',
                                                    tio.label, 'creator_type', tio.creator_type, 'description',
                                                    tio.description, 'content', tio.content)::JSON
                           else json_build_object('url', fp.url, 'type', fp.type, 'filename', fp.filename, 'label',
                                                  tio.label, 'creator_type', tio.creator_type, 'description',
                                                  tio.description, 'metadata', fp.metadata)::JSON
                   end)
                 else '{}'::JSON
                 end)) as outputs
    from task t
           full outer join task_input_output tio on t.id = tio.task_id
           full outer join project_file_all fp on tio.file_project_id = fp.id
    group by t.id
    order by t.id desc
      );

    RAISE NOTICE '-> Erstelle project_all View...';
    CREATE OR REPLACE VIEW project_all AS
    (
    with account_roles as (
      select ar.account_id,
             ac.username,
             ar.project_id,
             r.label as label,
             r.scope,
             r.id    as role_id,
             ar.valid_startdate,
             ar.valid_enddate
      from account_role_project ar
             full outer join role r on ar.role_id = r.id
             full outer join account_all ac on ar.account_id = ac.id
      where project_id is not NULL
    )
    select pr.id,
           pr.name,
           pr.description,
           pr.configuration,
           pr.startdate,
           pr.enddate,
           pr.active,
           case
             when count(ar.account_id) = 0 then null
             else json_agg(json_strip_nulls(json_build_object('account_id', ar.account_id,
                                                              'username', ar.username,
                                                              'role', ar.label,
                                                              'valid_startdate', ar.valid_startdate,
                                                              'valid_enddate', ar.valid_enddate
               )))::JSON end                                               as account_roles,
           count(task.id)::integer                                         as tasks_count,
           count(case when task.status = 'FREE' then task.id end)::integer as tasks_count_free,
           pr.creationdate,
           pr.updatedate
    from task
           full outer join project pr on task.project_id = pr.id
           full outer join account_roles ar on pr.id = ar.project_id
    where pr.id IS NOT NULL
    group by pr.id
    order by pr.id);
  END;
$$;
COMMIT;
