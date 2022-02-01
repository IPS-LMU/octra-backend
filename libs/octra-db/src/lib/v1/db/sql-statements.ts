export const OCTRASQLStatements = {
  allUsersWithRoles: '' +
    `with account_general_role as (
      select ac.id as account_id, r.label, r.scope
      from account ac
             full outer join role r on ac.role_id = r.id
      where ac.id IS NOT NULL
    ),
          account_roles as (
            select ar.account_id, ar.project_id, r.label as label, r.scope
            from account_role_project ar
                   full outer join role r on ar.role_id = r.id
            union
            select agr.account_id, NULL, agr.label, agr.scope
            from account_general_role agr
          ),
          user_roles as (
            select ac.*,
                   r.label                                                                       as role,
                   json_agg((case
                               when pr.id is not null then json_build_object('project_id', pr.id,
                                                                             'project_name', pr.name,
                                                                             'role', ar.label,
                                                                             'scope', ar.scope)
                               else json_build_object('role', ar.label, 'scope', ar.scope) end)) as user_roles
            from account ac
                   full outer join account_roles ar on ac.id = ar.account_id
                   full outer join project pr on pr.id = ar.project_id
                   full outer join role r on ac.role_id = r.id
            where ar.account_id is not null
            group by ac.id, r.label
          )
     select *
     from user_roles ac`
};
