// App.java
package com.example.firsttry;

import android.app.Application;
import com.example.firsttry.authentication.AuthManager;

public class App extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        // 这里的 this 就是 Application，本身就是一个 Context
        AuthManager.init(this);
    }
}