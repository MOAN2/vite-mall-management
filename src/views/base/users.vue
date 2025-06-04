<template>
  <div class="container">
    <div class="header">
      <h2>管理员</h2>
      <div class="header-actions">
        <el-input
          v-model="searchValue"
          style="width: 240px"
          placeholder="请输入用户名称"
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
        <el-button v-if="isSuperAdmin" type="primary" @click="handleAdd"
          >新增管理员</el-button
        >
      </div>
    </div>

    <!-- 表格区域 -->
    <el-table
      stripe
      :data="tableData"
      border
      style="width: 100%"
      v-loading="loading"
      fit
    >
      <el-table-column prop="id" label="管理员ID" min-width="100" />
      <el-table-column prop="nickname" label="管理员名称" min-width="150" />
      <el-table-column prop="username" label="用户名" min-width="150" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="phone" label="手机号" min-width="120" />
      <el-table-column prop="superAdmin" label="超级管理员" min-width="100">
        <template #default="scope">
          {{ scope.row.superAdmin ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="scope">
          {{ scope.row.status ? "启用" : "禁用" }}
        </template>
      </el-table-column>
      <el-table-column label="管理员头像" min-width="80">
        <template #default="{ row }">
          <div class="avatar" v-if="row.avatar">
            <img :src="row.avatar" width="36" height="36" />
          </div>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="170">
        <template #default="scope">
          {{ scope.row.createdTime ? formatDate(scope.row.createdTime) : "-" }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isSuperAdmin"
        label="操作"
        min-width="180"
        fixed="right"
      >
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button v-if="!scope.row.superAdmin" type="danger" size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="550px"
      center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="用户名称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="默认密码" prop="password">
          <el-input v-model="form.password"  disabled/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="超级管理员" prop="superAdmin">
          <el-select v-model="form.superAdmin" style="width: 100%">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-upload
            :file-list="headImg"
            :action="uploadUrl"
            list-type="picture-card"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="handleUploadHead"
            :on-remove="handleRemove"
          >
            <el-icon v-if="headImg.length == 0"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import { beforeUpload } from "@/utils/common.js";
import { useUserStore } from "@/stores/user";
import * as api from "@/api/login.js";

const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.userInfo.superAdmin);

// 格式化日期函数
const formatDate = (date) => {
  return dayjs(date).format("YYYY/MM/DD HH:mm");
};

const BASE_URL = import.meta.env.VITE_URL;
let uploadUrl = `/api/admin/file/upload`;

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const headImg = ref([]);
const searchValue = ref("");

// 弹窗相关
const dialogVisible = ref(false);
const dialogType = ref("add"); // 'add' 或 'edit'
const formRef = ref(null);
const form = reactive({
  id: null,
  username: "",
  nickname: "",
  email: "",
  phone: "",
  avatar: "",
  status: true,
  superAdmin: false,
  password: "123456",
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
  ],
  nickname: [
    { required: true, message: "请输入用户名称", trigger: "blur" },
    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
};

watch(dialogVisible, (newValue) => {
  if (!newValue) {
    headImg.value = [];
  }
});

// 获取路径
const getPath = (iconValue) => {
  return BASE_URL + iconValue;
};

// 处理主图文件上传
const handleUploadHead = (response, file) => {
 
  if (response && response.code === 200 && response.data) {
    headImg.value = [
      {
        name: file.name,
        url: `${BASE_URL}${response.data}`,
      },
    ];
  }
};

// 处理文件移除
const handleRemove = () => {
  headImg.value = [];
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  try {
    const { data } = await api.getUsersApi({
      pageNo: currentPage.value,
      pageSize: pageSize.value,
      nickname: searchValue.value,
    });
    tableData.value = data?.dataList || [];
    total.value = Number(data.totalCount) ||0;
  } catch (error) {
    ElMessage.error(error || "获取数据失败");
  }
  loading.value = false;
};

// 页码变化
const handleCurrentChange = (val) => {
  if (val === currentPage.value) return; // 如果页码没变，不重新加载
  currentPage.value = val;
  loadTableData();
};

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTableData();
};

// 新增用户
const handleAdd = () => {
  dialogType.value = "add";
  Object.assign(form, {
    id: null,
    username: "",
    nickname: "",
    email: "",
    phone: "",
    avatar: "",
    superAdmin: false,
    status: true,
    password: "123456",
  });
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row) => {
  dialogType.value = "edit";
  if (row.avatar) {
    headImg.value = [
      {
        name: "头像",
        url: `${row.avatar}`,
      },
    ];
  } else {
    headImg.value = [];
  }
  Object.assign(form, {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    superAdmin: row.superAdmin,
    status: row.status,
    password: "123456",
  });
  dialogVisible.value = true;
};

// 删除用户
const handleDelete = (row) => {
 
  ElMessageBox.confirm(`确定要删除用户"${row.nickname}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        await api.delUserApi({ id: row.id });
        loadTableData();
        ElMessage.success("删除成功");
      } catch (error) {
        ElMessage.error(error || "删除失败，请重试");
      }
    })
    .catch(() => {
      // 取消删除
    });
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = { ...form };
 
        if (headImg.value && headImg.value.length > 0) {
          submitData.avatar = headImg.value[0].url;
        }

        if (dialogType.value === "add") {
          await api.createUserApi(submitData);
          ElMessage.success("新增成功");
        } else {
          await api.updateUserInfoApi(submitData);
          ElMessage.success("更新成功");
        }

        loadTableData();
        dialogVisible.value = false;
      } catch (error) {
        ElMessage.error(error || "操作失败，请重试");
      }
    }
  });
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置页码
  loadTableData();
};

// 页面加载时获取数据
onMounted(() => {
  loadTableData();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  border-radius: 50%;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.header-actions {
  display: flex;
  gap: 10px;
}
</style>
