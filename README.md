# Team Building

## Vietnamese

### Giới thiệu:
Team Building là một phần mềm được viết ra nhằm quản lí tiến độ công việc, người quản lí công ty quản lí công việc, nhân viên dễ dàng hơn.

### Chức năng
- Thêm mới một dự án
- Thêm nhóm công việc của dự án
- Thêm các công việc con (Không giới hạn độ sâu)
- Bình luận về công việc
- Phân quyền tài khoản người dùng sâu theo dự án, theo công việc: Quyền owner, quyền admin, quyền user
- Chức năng Team

### Khả năng mở rộng
- Code viết tách biệt theo mô hình Component.
- Function được viết riêng biệt theo chức năng

### Huớng dẫn sử dụng
1. Cài đặt
```
$ git clone https://github.com/vantuan1303/TeamBuildingv2.0.git
$ cd TeamBuildingv2.0
$ yarn
```

Khởi tạo file .env với các thông số sau:

```
MONGO_URL=mongodb://dbName:dbPass@localhost:27018/db?replicaSet=rs0
DB_TEST_URL=mongodb://dbTestName:dbTestPass@localhost:27019/db?replicaSet=rs0
PORT=3001
HOST=localhost
EMAIL_USER=yourEmail@gmail.com
EMAIL_PASS=yourPass
SECRET_STRING=secrectKey
ACCESS_CONTROL_ORIGIN=*
```

```
$ yarn start
```

2. Chạy test
- Chạy test không cần database
```
$ yarn run test
```
- Chạy test qua database 
Bạn cần mở database đã được khai báo tại DB_TEST_URL.
$ yarn run dbtest
- Chạy debug test
Sử dụng Chrome Dev Team để test. Không cần mở DB_TEST
```
$ yarn run debugtest
```
### API

#### AUTH
##### POST
- `/login`
```
@param: body: { email, password}
@return: user with token key
```

#### USER

| METHOD | API                    | PARAMS                                              | RETURN |
|--------|------------------------|-----------------------------------------------------|--------|
| POST   | /                      | body: { name, email, password }                     | user   |
|        | /admin                 | body: { name, email, password }                     | user   |
|        | /admin/:userIds/block  | params: { userIds }                                 | raw    |
|        | /admin/:userIds/unlock | params: { userIds }                                 | raw    |
| GET    | /                      |                                                     | users  |
|        | /:userId               | params: { userId }                                  | user   |
|        | /get-by-email/:email   | params: { email}                                    | user   |
| PUT    | /:userId               | body: { name, email, password }, params: { userId } | user   |
| DELETE | /admin/:userId         | params: { userId }                                  | raw    |

#### PROJECT

| METHOD | API                               | PARAMS                                                                       | RETURN   |
|--------|-----------------------------------|------------------------------------------------------------------------------|----------|
| POST   | /                                 | body: { title, description, isAllowMemberAddMember }                         | project  |
|        | /:projectId/delete                | params: { projectId }                                                        | project  |
|        | /:projectId/restore               | params: { projectId }                                                        | project  |
|        | /:projectId/stored                | params: { projectId }                                                        | project  |
|        | /:projectId/undoStored            | params: { projectId }                                                        | project  |
|        | /:projectId/add-members           | params: { projectId }, body: { userIds }                                     |          |
|        | /:projectId/remove-members        | params: { projectId }, body: { userIds }                                     |          |
|        | /:projectId/agree-join-project    | params: { projectId }                                                        |          |
|        | /:projectId/disagree-join-project | params: { projectId }                                                        |          |
|        | /:projectId/leave-project         | params: { projectId }                                                        |          |
|        | /:projectId/change-user-role      | params: { projectId }, body: { userId, role }                                | user     |
| GET    | /                                 |                                                                              | projects |
|        | /:projectId                       | params: { projectId }                                                        | project  |
| PUT    | /:projectId                       | params: { projectId },  body: { title, description, isAllowMemberAddMember } | project  |
| DELETE | /:projectId                       | params: { projectId }                                                        | raw      |

#### JOB
##### POST
- `/`
```
@param: body: { title, description, isAllowMemberAddMember }, query: {projectId}
@return: job
```
- `/sub-job`
```
@param: body: { title, description, isAllowMemberAddMember }, query: {jobId}
@return: job
```
- `/:jobId/delete"`
```
@return: job
```
- `/:jobId/restore`
```
@return: job
```
- `/:jobId/completed`
```
@return: job
```
- `/:jobId/undoCompleted`
```
@return: job
```
- `/:jobId/add-members"`
```
@param: body: { userIds }
```
- `/:jobId/remove-members`
```
@param: body: { userIds }
```
- `/:jobId/agree-join-job`
- `/:jobId/disagree-join-job`
- `/:jobId/leave-job`
- `/:jobId/change-user-role`
```
@return: user
```
##### GET
- `/`
```
@param: query: { projectId }
@return: jobs
```
- `/sub-jobs`
```
@param: query: { jobId }
@return: jobs
```
- `/:jobId`
##### PUT
- `/:jobId"`
```
@param: body: { title, description, isAllowMemberAddMember }
@return: jobs
```
##### DELETE
- `/:jobId`
```
@return: raw
```

#### NOTIFY
##### GET
- `/`
```
@param: query: { isAction }
@return: notifies
```

#### COMMENT
##### POST
- `/`
```
@param: body: { body }, query: { jobId }
@return: comment
```
##### GET
- `/`
```
@param: query: { jobId }
@return: comments
```
- `/:commentId`
```
@return: comment
```
##### PUT
- `/:commentId`
```
@param: body: { body }
@return: comment
```
##### DELETE
- `/:commentId`
```
@return: raw
```

#### TEAM
##### POST
- `/`
```
@param: name, description
@return: team
```
- `/:teamId/add-members`
```
@param: body: { userIds }
```
- `/:teamId/remove-members`
```
@param: body: { userIds }
```
- `/:teamId/agree-join-team`
- `/:teamId/disagree-join-team`
- `/:teamId/leave-team`
- `/:teamId/change-user-role`
```
@param: body: { userId, role  }
```

##### GET
- `/`
```
@return: teams
```
- `/get-by-user`
```
@return: teamss
```
- `/:teamId`
```
@return: teams
```
##### PUT
- `/:teamId`
```
@param: body: { name, description }
@return: teams
```
##### DELETE

### Thông tin tác giả:

```
Tên: Nguyễn Văn Tuấn
Email: vantuan130393@gmail.com
Phone: 033 557 8022
```
