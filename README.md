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
- `/login` => user with token key

#### USER

##### POST
- `/`
```
@param: body: { name, email, password}
@return: user
```
- `/admin`
```
@param: body: { name, email, password}
@return: user
```
- `/admin/:userIds/block` => raw
- `/admin/:userIds/unlock` => raw

##### GET
- `/` => users
- `/:userId` => user
- `/get-by-email/:email` => user

##### PUT
- `/:userId` => user

##### DELETE
- `/admin/:userId` => raw

#### PROJECT

##### POST
- `/`
- `/:projectId/delete`
- `/:projectId/restore`
- `/:projectId/stored`

##### GET

##### PUT

##### DELETE
- `/:projectId`


### Thông tin tác giả:

```
Tên: Nguyễn Văn Tuấn
Email: vantuan130393@gmail.com
Phone: 033 557 8022
```
