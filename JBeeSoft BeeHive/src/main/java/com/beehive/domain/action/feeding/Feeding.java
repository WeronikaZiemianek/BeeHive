package com.beehive.domain.action.feeding;

import com.beehive.domain.dateaudit.DateAudit;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Entity
@Table(name = "feeding", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "feedType"
        })
})

public class Feeding extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 40)
    private String feedType;

    @NotBlank
    private Integer feedAmount;

    @NotBlank
    private Integer price;

    public Feeding(String feedType, Integer feedAmount, Integer price) {
        this.feedType = feedType;
        this.feedAmount = feedAmount;
        this.price = price;
    }

    @OneToMany
    @JoinTable(name = "action",
            joinColumns = @JoinColumn(name = "concreteActionId"))

    public Long getId() {
        return id;
    }

    public String getFeedType() {
        return feedType;
    }

    public void setFeedType(String feedType) {
        this.feedType = feedType;
    }

    public Integer getFeedAmount() {
        return feedAmount;
    }

    public void setFeedAmount(Integer feedAmount) { this.feedAmount = feedAmount; }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }
}