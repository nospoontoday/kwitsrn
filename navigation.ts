export type RootStackParamList = {
    // Because you're calling `navigation.navigate("HomeTabs")` without params:
    HomeTabs: undefined;  
    
    // The route receives `conversation` as a param:
    ChatRoom: { conversation: any, linkRoute?: string }; 
  
    // AddExpense also has a param named `conversation`:
    AddExpense: { conversation: any }; 
  
    // This might require no params:
    Friends: undefined;
    Login: undefined;
    CreateAccount: undefined;
    ForgotPassword: undefined;
  };
  