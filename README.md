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

### CẤU TRÚC APP

![alt](https://i.imgur.com/bXjYIUr.png)

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

| METHOD | API    | PARAMS                    | RETURN |
|--------|--------|---------------------------|--------|
| POST   | /login | body: { email, password } | user   |

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
|        | /:projectId/show-members          | params: { projectId }                                                        | members  |
| PUT    | /:projectId                       | params: { projectId },  body: { title, description, isAllowMemberAddMember } | project  |
| DELETE | /:projectId                       | params: { projectId }                                                        | raw      |

#### JOB

| METHOD | API                       | PARAMS                                                                      | RETURN  |
|--------|---------------------------|-----------------------------------------------------------------------------|---------|
| POST   | /                         | body: { title, description, isAllowMemberAddMember },  query: { projectId } | job     |
|        | /sub-job                  | body: { title, description, isAllowMemberAddMember }, query: { jobId }      | job     |
|        | /:jobId/delete            | params: { jobId }                                                           | job     |
|        | /:jobId/restore`          | params: { jobId }                                                           | job     |
|        | /:jobId/completed         | params: { jobId }                                                           | job     |
|        | /:jobId/undoCompleted     | params: { jobId }                                                           | job     |
|        | /:jobId/add-members       | params: { jobId }, body: { userIds }                                        |         |
|        | /:jobId/remove-members    | params: { jobId }, body: { userIds }                                        |         |
|        | /:jobId/agree-join-job    | params: { jobId }                                                           |         |
|        | /:jobId/disagree-join-job | params: { jobId }                                                           |         |
|        | /:jobId/leave-job         | params: { jobId }                                                           |         |
|        | /:jobId/change-user-role  | params: { jobId }, body: { userId, role }                                   | user    |
| GET    | /                         | query: { projectId }                                                        | jobs    |
|        | /sub-jobs                 | query: { jobId }                                                            | jobs    |
|        | /:jobId                   | params: { jobId }                                                           | job     |
|        | /:jobId/show-members      | params: { jobId }                                                           | members |
| PUT    | /:jobId                   | body: { title, description, isAllowMemberAddMember }                        | job     |
| DELETE | /:jobId                   | params: { jobId }                                                           | raw     |

#### NOTIFY

| METHOD | API | PARAMS              | RETURN   |
|--------|-----|---------------------|----------|
| GET    | /   | query: { isAction } | notifies |

#### COMMENT

| METHOD | API          | PARAMS                                | RETURN   |
|--------|--------------|---------------------------------------|----------|
| POST   | /            | body: { body }, query: { jobId }      | comment  |
| GET    | /            | query: { jobId }                      | comments |
|        | /:commentId  | params: { commentId }                 | comment  |
| PUT    | /:commentId  | params: { commentId }, body: { body } | comment  |
| DELETE | /:commentId  | params: { commentId }                 | raw      |

#### TEAM

| METHOD | API                         | PARAMS                                           | RETURN  |
|--------|-----------------------------|--------------------------------------------------|---------|
| POST   | /                           | body: { name, description }                      | team    |
|        | /:teamId/add-members        | params: { teamId },  body: { userIds }           |         |
|        | /:teamId/remove-members     | params: { teamId },  body: { userIds }           |         |
|        | /:teamId/agree-join-team    | params: { teamId }                               |         |
|        | /:teamId/disagree-join-team | params: { teamId }                               |         |
|        | /:teamId/leave-team         | params: { teamId }                               |         |
|        | /:teamId/change-user-role   | params: { teamId },  body: { userId, role }      | user    |
| GET    | /                           |                                                  | teams   |
|        | /get-by-user                |                                                  | teams   |
|        | /:teamId                    | params: { teamId }                               | team    |
|        | /:teamId/show-members       | params: { teamId }                               | members |
| PUT    | /:teamId                    | params: { teamId },  body: { name, description } | team    |
| DELETE | /:teamId                    | params: { teamId }                               | raw     |

### Thông tin tác giả:

```
Tên: Nguyễn Văn Tuấn
Email: vantuan130393@gmail.com
Phone: 033 557 8022
```
