# Role Hierarchy & Permissions

## Role Structure

### ADMIN 👑 (Super Privileges)
**Full control over everything**
- ✅ Manage all users (view, ban, delete)
- ✅ Assign/remove ANY role including ADMIN
- ✅ Can ban/delete any user including other admins
- ✅ Access to all sections:
  - Overview dashboard
  - Submissions moderation
  - Winners management
  - User management (full control)
- ✅ Can create new admin accounts

### STREAMER 🌟 (Moderation + Review Access)
**Can moderate AND mark winners**
- ✅ Approve/deny submissions (like moderators)
- ✅ Mark videos as winners
- ✅ Access review interface
- ✅ Access moderation dashboard
- ✅ Can view all users
- ❌ **Cannot change user roles** (view-only for user management)
- ❌ Cannot assign ADMIN role
- ❌ Cannot assign STREAMER role (ADMIN only)
- ❌ Cannot manage other STREAMER roles
- ❌ Cannot ban admins
- ❌ Cannot delete users

### MODERATOR 🛡️ (Content Moderation)
**Can moderate submissions**
- ✅ Approve/deny submissions
- ✅ Remove submissions
- ✅ Can view users
- ❌ Cannot mark videos as winners
- ❌ Cannot access review interface
- ❌ **Cannot change user roles** (view-only for user management)
- ❌ Cannot ban admins
- ❌ Cannot delete users

### VIEWER 👀 (Lowest Level)
**Can submit videos**
- ✅ Submit videos
- ❌ Cannot moderate
- ❌ Cannot access dashboard
- ❌ Cannot view other users

## Detailed Permission Matrix

| Action | VIEWER | MODERATOR | STREAMER | ADMIN |
|--------|:------:|:---------:|:--------:|:-----:|
| **Video Submission** |
| Submit videos | ✅ | ✅ | ✅ | ✅ |
| **Content Moderation** |
| Approve submissions | ❌ | ✅ | ✅ | ✅ |
| Deny submissions | ❌ | ✅ | ✅ | ✅ |
| Remove submissions | ❌ | ✅ | ✅ | ✅ |
| Mark as winner | ❌ | ❌ | ✅ | ✅ |
| **Dashboard Access** |
| Overview | ❌ | ✅ | ✅ | ✅ |
| Submissions | ❌ | ✅ | ✅ | ✅ |
| Winners | ❌ | ✅ | ✅ | ✅ |
| Users | ❌ | ✅ | ✅ | ✅ |
| **Review Interface** |
| Access review page | ❌ | ❌ | ✅ | ✅ |
| Navigate approved videos | ❌ | ❌ | ✅ | ✅ |
| **User Management** |
| View users | ❌ | ✅ | ✅ | ✅ |
| Change roles | ❌ | ❌ | ❌ | ✅ |
| Ban users | ❌ | ✅* | ✅* | ✅ |
| Delete users | ❌ | ❌ | ❌ | ✅ |
| Create admins | ❌ | ❌ | ❌ | ✅ |

*Cannot ban admins

## Role Change Rules

### Who Can Assign Roles?

**ADMIN:**
- Can assign any role (VIEWER, MODERATOR, STREAMER, ADMIN)
- Only role that can assign ADMIN role

**STREAMER:**
- Cannot change any roles (view-only)

**MODERATOR:**
- Cannot change any roles (view-only)

**VIEWER:**
- No access to user management

### Protected Actions

1. **ADMIN Role Assignment**: Only admins can assign admin role
2. **STREAMER Role Assignment**: Only admins can assign streamer role
3. **Admin Protection**: Non-admins cannot:
   - Change admin roles
   - Ban admins
   - Delete admins
4. **Role Management**: Only admins have UI to change roles (others see read-only)

## Common Workflows

### Making Someone a Moderator
1. **Admin** goes to `/moderation/users`
2. Finds the user
3. Changes role to "Moderator"
4. User can now moderate submissions

### Making Someone a Streamer
1. **Admin only** goes to `/moderation/users`
2. Finds the user
3. Changes role to "Streamer"
4. User can now moderate AND mark winners

### Creating a New Admin
1. Current **Admin** goes to `/moderation/users`
2. Finds the user to promote
3. Changes role to "Admin"
4. Only admins see the "Admin" option in dropdown
5. New admin has full privileges

## Security Notes

- STREAMER cannot promote themselves to ADMIN
- MODERATOR cannot grant themselves STREAMER role
- Only ADMINS can see role management UI
- Others see read-only user list
- Role changes are logged in moderation_logs
- Database constraints enforce valid roles only

## Visual Indicators

- **ADMIN**: Purple badge (👑) - Full control
- **STREAMER**: Pink badge (🌟) - Can mark winners
- **MODERATOR**: Orange badge (🛡️) - Can approve/deny
- **VIEWER**: Blue badge (👀) - Can submit

## Database Constraint

```sql
CHECK (role IN ('VIEWER', 'MODERATOR', 'STREAMER', 'ADMIN'))
```

Only these 4 roles are allowed in the system.

