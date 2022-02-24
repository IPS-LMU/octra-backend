export const OCTRASQLStatements = {
  allUsersWithRoles: '' +
    `with account_roles as (
      select ar.account_id as id, ar.project_id, r.label as label, r.scope, r.id as role_id
      from account_role_project ar
             full outer join role r on ar.role_id = r.id
      union
      select agr.id, NULL, agr.role, 'general', NULL
      from account_all agr
    ),
          user_roles as (
            select ac.*,
                   json_agg((case
                               when pr.id is not null then json_build_object('project_id', pr.id,
                                                                             'project_name', pr.name,
                                                                             'role', ar.label,
                                                                             'scope', ar.scope)
                               else json_build_object('role', ar.label, 'scope', ar.scope) end)) as user_roles
            from account_all ac
                   full outer join account_roles ar on ac.id = ar.id
                   full outer join project pr on pr.id = ar.project_id
                   full outer join role r on ar.role_id = r.id
            where ar.id is not null
            group by ac.id, ac.person_id, ac.username, ac.email, ac.loginmethod, ac.hash, ac.active, ac.training,
                     ac.comment, ac.role, ac.creationdate, ac.updatedate, r.label
          )
     select ac.*
     from user_roles ac`
};
