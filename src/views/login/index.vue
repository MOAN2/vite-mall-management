<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo-title.png" class="logo" alt="Logo" />
        <h2 class="welcome">欢迎使用后台管理系统</h2>
      </div>
      
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 登录面板 -->
        <el-tab-pane label="登录" name="login">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" status-icon>
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名" 
                prefix-icon="icon-ep-user"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                placeholder="请输入密码" 
                prefix-icon="icon-ep-lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <div class="remember-row">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <el-button type="text" class="forget-btn">忘记密码？</el-button>
              </div>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <!-- 注册面板 -->
        <el-tab-pane label="注册" name="register">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" status-icon>
            <el-form-item prop="username">
              <el-input 
                v-model="registerForm.username" 
                placeholder="请输入用户名" 
                prefix-icon="icon-ep-user"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="registerForm.password" 
                placeholder="请输入密码" 
                prefix-icon="icon-ep-lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input 
                v-model="registerForm.confirmPassword" 
                placeholder="请确认密码" 
                prefix-icon="icon-ep-lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item prop="email">
              <el-input 
                v-model="registerForm.email" 
                placeholder="请输入邮箱" 
                prefix-icon="icon-ep-message"
                clearable
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" class="submit-btn" :loading="loading" @click="handleRegister">
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      
      <div class="login-footer">
        <p>© 2023 后台管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')
const userStore = useUserStore()

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

// 注册表单
const registerFormRef = ref(null)
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 调用store中的登录方法
      userStore.login(loginForm)
        .then(() => {
          ElMessage.success('登录成功')
          router.push('/category/index')
        })
        .catch(error => {
          ElMessage.error(error.message || '登录失败')
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

// 注册处理
const handleRegister = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      // 模拟注册请求
      setTimeout(() => {
        ElMessage.success('注册成功，请登录')
        loading.value = false
        activeTab.value = 'login'
        // 实际项目中应调用注册API
      }, 1500)
    }
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.login-box {
  width: 420px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
  
  .logo {
    height: 50px;
    margin-bottom: 16px;
  }
  
  .welcome {
    font-size: 22px;
    color: #303133;
    margin: 0;
    font-weight: 500;
  }
}

.login-tabs {
  margin-bottom: 20px;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .forget-btn {
    padding: 0;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 12px;
}

:deep {
  .el-input__wrapper {
    padding-left: 11px;
  }
  
  .el-tabs__item {
    font-size: 16px;
  }
  
  .el-form-item {
    margin-bottom: 22px;
  }
  
  .el-input__inner {
    height: 44px;
  }
}
</style>
