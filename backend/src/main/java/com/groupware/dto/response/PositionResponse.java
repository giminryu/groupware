package com.groupware.dto.response;

import lombok.Data;

/**
 * 직급 응답 DTO
 */
@Data
public class PositionResponse {

    private Long id;
    private String name;
    private int level;
    private int approvalRank;
}
