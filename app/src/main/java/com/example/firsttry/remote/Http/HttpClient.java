// package 请改成你的：com.example.firsttry.data.remote
package com.example.firsttry.remote.Http;

import okhttp3.OkHttpClient;

public class HttpClient {

    private static OkHttpClient client;

    public static OkHttpClient getClient() {
        if (client == null) {
            client = new OkHttpClient.Builder()
                    // 这里以后可以加拦截器、超时配置等
                    .build();
        }
        return client;
    }

    public static final String BASE_URL = "http://10.0.2.2:8080/api/";
}