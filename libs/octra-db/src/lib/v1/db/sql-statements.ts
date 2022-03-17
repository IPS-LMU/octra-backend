export const OCTRASQLStatements = {
  allUsersWithRoles: `
    with account_roles as (
      select ar.account_id as id, ar.project_id, r.label as label, r.scope, r.id as role_id
      from account_role_project ar
             full outer join role r on ar.role_id = r.id
      union
      select agr.id, NULL, agr.role, 'general', NULL
      from account_all agr
    ),
         user_roles as (
           select ar.id,
                  json_agg(json_strip_nulls(json_build_object('project_id', ar.project_id,
                                                              'role', ar.label,
                                                              'project_name', pr.name,
                                                              'scope', ar.scope))) as access_rights
           from account_roles as ar
                  full outer join project pr on pr.id = ar.project_id
           group by ar.id
         ),
         account_rows as (
           select ac.*, ur.access_rights
           from account_all ac
                  left join user_roles ur on ur.id = ac.id
         )
    select ac.*
    from account_rows ac`,
  allProjectsWithRoles: `
    select *
    from project_all`
};
