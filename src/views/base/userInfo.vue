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
        label-width="80px"
        class="user-form">
        <el-form-item class="avatar-container" label="头像">
   
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :limit="1"
            
            :before-upload="beforeUpload"
            :on-success="handleUploadHead"
            :on-remove="handleRemove"
             :action="uploadUrl"
       >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <el-icon v-if="!form.avatar"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="用户名" prop="nickname">
          <el-input v-model="form.nickname" tui/>
        </el-form-item>

        <el-form-item label="">
          <el-button type="primary" @click="showPasswordDialog">修改密码</el-button>
          <el-button type="primary" @click="submitForm">保存</el-button>
        </el-form-item>
 
      </el-form>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { updateUserInfoApi, changePasswordApi } from '@/api/login'
const BASE_URL = import.meta.env.VITE_URL;
let uploadUrl = `/api/admin/file/upload`;
const userStore = useUserStore()
const formRef = ref(null)
const passwordFormRef = ref(null)
const passwordDialogVisible = ref(false)

// 表单数据
const form = reactive({
  nickname: '',
  avatar: ''
})

// 密码表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  nickname: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
  ]
}
watch(dialogVisible, (newValue) => {
  if (!newValue) {
    headImg.value = [];
    
  }
});
// 密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 10,message: '密码长度不能少于6个字符,多于10个字符', trigger: 'blur' }
    
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  const userInfo = await userStore.fetchUserInfo()
  if (userInfo) {
    form.nickname = userInfo.nickname
    form.avatar = userInfo.avatar
  }
}

// 图片上传前验证
const beforeUpload = (file) => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 2MB!");
    return false;
  }
  return true;
};
// 处理主图文件上传
const handleUploadHead = (response, file) => {
  if (response && response.code === 200 && response.data) {
    // 替换headImg数据，确保只有服务器返回的图片
    form.avatar = `${BASE_URL}${response.data}`
  }
};
// 处理文件移除
const handleRemove = async () => {
  headImg.value = [];
};
// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

// 提交密码修改
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // todo
        const { oldPassword, newPassword } = passwordForm
        const res = await changePasswordApi({ oldPassword, newPassword })
        if (res.code === 0) {
          ElMessage.success('密码修改成功')
          passwordDialogVisible.value = false
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('密码修改失败')
      }
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await updateUserInfoApi({
          nickname: form.nickname,
          avatar: form.avatar
        })
        
        if (res.code === 0) {
            // todo
          await userStore.setUserInfo({
            ...userStore.userInfo,
            nickname: form.nickname,
            avatar: form.avatar
          })
          ElMessage.success('保存成功')
        } else {
          ElMessage.error(res.message || '保存失败')
        }
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }
  })
}

onMounted(() => {
  getUserInfo()
})
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

.avatar-uploader {
  text-align: center;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border-radius: 50%;
  line-height: 100px;
}
</style>