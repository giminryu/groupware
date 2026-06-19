package com.groupware.dto.request;

import lombok.Data;

@Data
public class NoticeRequest {
    private String title;
    private String content;
    private String visibility = "ALL";
    private Boolean viewRequired = false;
}
