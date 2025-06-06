<template>
  <div class="container">
    <div class="user-info-card">
      <div class="card-header">
        <h3>个人信息</h3>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="user-form"
      >
        <el-form-item class="avatar-container" label="头像">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="handleUploadHead"
            :on-remove="handleRemove"
            :action="uploadUrl"
            accept="image/*"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" :maxlength="11" />
        </el-form-item>

        <el-form-item label="超级管理员" prop="superAdmin">
          <el-select v-model="form.superAdmin" disabled style="width: 100%">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item label="启用状态" prop="status">
          <el-select v-model="form.status" disabled style="width: 100%">
            <el-option label="启动" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="showPasswordDialog"
            >修改密码</el-button
          >
          <el-button type="primary" @click="submitForm">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElLoading, ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores/user";
import {
  updateUserInfoApi,
  changePasswordApi,
  getUserDetailApi,
} from "@/api/login";
import { beforeUpload } from "@/utils/common.js";
const BASE_URL = import.meta.env.VITE_URL;
let uploadUrl = `/api/admin/file/upload`;
const userStore = useUserStore();
const formRef = ref(null);
const passwordFormRef = ref(null);
const passwordDialogVisible = ref(false);

// 表单数据
let form = reactive({
  username: "",
  nickname: "",
  email: "",
  phone: "",
  avatar: "",
  superAdmin: false,
  status: true,
});

// 密码表单数据
const passwordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", trigger: "blur", message: "请输入正确的邮箱" },
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

// 密码表单验证规则
const passwordRules = {
  newPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      min: 6,
      max: 10,
      message: "密码长度不能少于6个字符,多于10个字符",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 获取用户信息
const getUserInfo = async () => {
  const loading = ElLoading.service();
  try {
    const data = await userStore.fetchUserInfo();
    console.log("data", data);

    if (data) {
      form.id = data.id;
      form.username = data.username;
      form.email = data.email;
      form.avatar = data.avatar;
      form.phone = data.phone;
      form.nickname = data.nickname;
      form.superAdmin = data?.superAdmin || false;
      form.status = data?.status || true;
    }
  } catch (error) {
    console.log("e", error);
  }
  loading.close();
};

// 处理主图文件上传
const handleUploadHead = (response, file) => {
  if (response && response.code === 200 && response.data) {
    // 替换headImg数据，确保只有服务器返回的图片
    form.avatar = `${BASE_URL}${response.data}`;
  }
};
// 处理文件移除
const handleRemove = async () => {
  form.avatar = "";
};
// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordDialogVisible.value = true;

  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// 提交密码修改
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const { newPassword } = passwordForm;
        const res = await changePasswordApi({ newPassword, userId: form.id });
        if (res.code === 0) {
          ElMessage.success("密码修改成功");
          passwordDialogVisible.value = false;
        } else {
          ElMessage.error(res.message || "密码修改失败");
        }
      } catch (error) {
        ElMessage.error("密码修改失败");
      }
    }
  });
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updateUserInfoApi({
          ...form,
        });

        await userStore.setUserInfo({
          ...userStore.userInfo,
          ...form,
        });
        ElMessage.success("保存成功");
      } catch (error) {
        ElMessage.error(error || "保存失败");
      }
    }
  });
};

onMounted(() => {
  getUserInfo();
});
</script>

<style scoped>
.container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.user-info-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-form {
  margin-top: 20px;
}

.avatar-container {
  display: flex;
  justify-content: center;
}
::v-deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

::v-deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
