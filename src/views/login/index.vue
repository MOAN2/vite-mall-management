<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo-title.png" class="logo" alt="Logo" />
        <h2 class="welcome">欢迎使用后台管理系统</h2>
      </div>
      
 
        <!-- 登录面板 -->
     
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
            
            <!-- <el-form-item>
              <div class="remember-row">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            
              </div>
            </el-form-item> -->
            
            <el-form-item>
              <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
                登录
              </el-button>
            </el-form-item>
          </el-form>
      
      <div class="login-footer">
        <p>© 2025 轻洁家政后台管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
 import {loginApi} from '@/api/login'
 import { jwtDecode } from 'jwt-decode'
const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')
const userStore = useUserStore()

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
})



// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名长度应为3-10个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 10,message: '密码长度不能少于6个字符,多于10个字符', trigger: 'blur' }
  ]
}
const login = async () => {
  try {
    // const { data } = await loginApi({
    //   account: loginForm.username,
    //   password: loginForm.password
    // })
    router.push('/category/index')
    // todo
    // if (data) {
   
    //   localStorage.setItem('token', data.accessToken)
    //   userStore.setToken(data.accessToken)
    //   const code = jwtDecode(data.accessToken)
    //   console.log(code)
    //   // localStorage.setItem('user', JSON.stringify(code))

    //   ElMessage({
    //     message: '登陆成功',
    //     type: 'success',
    //     duration: 1000
    //   })

    //   router.push('/category/index')
    // }
  } catch (error) {
    loading.value = false

    ElMessage({
      message: error,
      type: 'error',
      duration: 1000
    })
  }
}

// 登录处理
const handleLogin = async ( ) => {
  try {
    loading.value = true
 
    loginFormRef.value.validate((valid, fields) => {

      if (valid) {
        login()
      } else {
        loading.value = false
 
      }
    })
  } catch (error) {
    loading.value = false
  }
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

 

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
 
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
