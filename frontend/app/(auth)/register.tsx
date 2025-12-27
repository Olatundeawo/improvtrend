import axios from 'axios'
import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Register() {
    const [form, setForm] = useState({
        email: "",
        username: "",
        password: ""
    })
    const URL = process.env.EXPO_PUBLIC_BASE_URL
    type Form = {
        email: string;
        username: string;
        password: string
    }

    const handleChange =<K extends keyof Form> ( field: K, value:Form[K]) => {
        setForm(prev => ({
            ...prev, [field]:value
        }))
    }

    const handleSubmit = async () => {
        try {
            const response = await axios.post(`${URL}auth/register/`, form);

            if(response.status !== 200) {
                console.log("Cant register")
            }
            
            setForm({
                email: "",
                username: "",
                password: ""
            })
        } catch (error) {
            
        }
    }
  return (
    <View>
        <Text>
            This is the regiter page.
        </Text>

        <View>
            <Text>Email</Text>
            <TextInput
            placeholder='Enter your Email'
            placeholderTextColor="#999"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType='email-address' 
            />
        </View>
        <View>
            <Text>
                Username
            </Text>
            <TextInput
            placeholder='Input a unique username' 
            placeholderTextColor="#999"
            onChangeText={(text) => handleChange('username', text)}

            />
        </View>
        <View>
            <Text>Password</Text>
            <TextInput
            placeholder='enter your password'
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}  
            secureTextEntry
            />
        </View>
        <TouchableOpacity
        onPress={handleSubmit}
        > 
       <Text> Login </Text>
        </TouchableOpacity>
    </View>
  )
}
