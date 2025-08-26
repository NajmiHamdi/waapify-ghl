<template>
  <div class="hello">
    <h1>Waapify-GHL Configuration</h1>
    <p>Configure your Waapify WhatsApp integration with GoHighLevel</p>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <p>Loading your configuration...</p>
    </div>
    
    <!-- Configuration form -->
    <div v-else class="config-form">
      <div class="form-group">
        <label for="access_token">Waapify Access Token:</label>
        <input 
          type="text" 
          id="access_token" 
          v-model="formData.access_token" 
          placeholder="Enter your Waapify Access Token"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="instance_id">Instance ID:</label>
        <input 
          type="text" 
          id="instance_id" 
          v-model="formData.instance_id" 
          placeholder="Enter your Waapify Instance ID"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="whatsapp_number">WhatsApp Number (optional):</label>
        <input 
          type="text" 
          id="whatsapp_number" 
          v-model="formData.whatsapp_number" 
          placeholder="e.g., +60123456789"
        />
      </div>
      
      <button @click="saveConfiguration" :disabled="saving" class="save-btn">
        {{ saving ? 'Saving...' : 'Save Configuration' }}
      </button>
      
      <div v-if="message" :class="messageClass">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      loading: true,
      saving: false,
      message: '',
      messageClass: '',
      userData: null,
      formData: {
        access_token: '',
        instance_id: '',
        whatsapp_number: ''
      }
    }
  },
  async mounted() {
    try {
      // Get user data from GHL
      this.userData = await window.ghl.getUserData();
      console.log("user-details", this.userData);
      
      // Load existing configuration if any
      await this.loadConfiguration();
      
    } catch (error) {
      console.error('Error loading user data:', error);
      this.message = 'Error loading user data';
      this.messageClass = 'error';
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadConfiguration() {
      try {
        // Try to load existing Waapify configuration
        const response = await fetch('/external-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            companyId: this.userData?.company?.id,
            locationId: this.userData?.location?.id
          })
        });
        
        const result = await response.json();
        if (result.success && result.data && result.data.access_token !== 'pending') {
          this.formData.access_token = result.data.access_token;
          this.formData.instance_id = result.data.instance_id;
          this.formData.whatsapp_number = result.data.whatsapp_number || '';
        }
        
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    },
    
    async saveConfiguration() {
      if (!this.formData.access_token || !this.formData.instance_id) {
        this.message = 'Please provide both Access Token and Instance ID';
        this.messageClass = 'error';
        return;
      }
      
      this.saving = true;
      this.message = '';
      
      try {
        const response = await fetch('/external-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            companyId: this.userData?.company?.id,
            locationId: this.userData?.location?.id,
            access_token: this.formData.access_token,
            instance_id: this.formData.instance_id,
            whatsapp_number: this.formData.whatsapp_number
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.message = 'Configuration saved successfully!';
          this.messageClass = 'success';
        } else {
          this.message = result.error || 'Error saving configuration';
          this.messageClass = 'error';
        }
        
      } catch (error) {
        console.error('Error saving configuration:', error);
        this.message = 'Error saving configuration';
        this.messageClass = 'error';
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>

<style scoped>
.hello {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.config-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #42b983;
  outline: none;
}

.save-btn {
  background-color: #42b983;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
}

.save-btn:hover {
  background-color: #369970;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success {
  color: #42b983;
  background-color: #f0f9ff;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}

.error {
  color: #e74c3c;
  background-color: #ffeaea;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}
</style>
