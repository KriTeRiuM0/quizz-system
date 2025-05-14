import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  username: string;
  isAdmin: boolean;
}

class AuthService {
  private readonly USERS_KEY = '@auth_users';
  private readonly CURRENT_USER_KEY = '@auth_current_user';

  async signUp(username: string, password: string): Promise<User> {
    try {
      const users = await this.getUsers();
      
      if (users[username]) {
        throw new Error('Username already exists');
      }

      const newUser: User = {
        username,
        isAdmin: username === 'admin' // First user with username 'admin' becomes admin
      };

      users[username] = {
        ...newUser,
        password // In a real app, this should be hashed
      };

      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return newUser;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async signIn(username: string, password: string): Promise<User> {
    try {
      const users = await this.getUsers();
      const user = users[username];

      if (!user || user.password !== password) {
        throw new Error('Invalid username or password');
      }

      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  private async getUsers(): Promise<Record<string, User & { password: string }>> {
    try {
      const usersJson = await AsyncStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : {};
    } catch (error) {
      console.error('Error in getUsers:', error);
      return {};
    }
  }
}

export const authService = new AuthService(); 