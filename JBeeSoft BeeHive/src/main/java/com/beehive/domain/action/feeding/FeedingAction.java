package com.beehive.domain.action.feeding;

import com.beehive.domain.action.Action;
import com.beehive.infrastructure.payload.FeedingActionDTO;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Entity
@Table(name = "feeding_actions")
public class FeedingAction extends Action {
	
    @NotBlank
    @Size(max = 40)
    private String feedType;

    @NotNull
    private Double feedAmount;

    @NotNull
    private Double price;
    
    public FeedingAction() {
    	
	}

    public FeedingAction(Builder builder) {
    	super(builder);
        this.feedType = builder.feedType;
        this.feedAmount = builder.feedAmount;
        this.price = builder.price;
    }


    public String getFeedType() {
        return feedType;
    }

    public void setFeedType(String feedType) {
        this.feedType = feedType;
    }

    public Double getFeedAmount() {
        return feedAmount;
    }

    public void setFeedAmount(Double feedAmount) { 
    	this.feedAmount = feedAmount; 
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
    
    public static Builder builder() {
    	return new Builder();
    }
    
    @Override
    public FeedingActionDTO.Builder builderDTO() {
    	return new FeedingActionDTO.Builder()
    			.withFeedAmount(feedAmount)
    			.withFeedType(feedType)
    			.withPrice(price)
    			.withActionName("Feeding");
    }
    
    public static class Builder extends Action.Builder<Builder> {

		private String feedType;
		private Double feedAmount;
		private Double price;

		@Override
		protected Builder self() {
			return this;
		}
		
		public Builder withFeedType(String feedType) {
			this.feedType = feedType;
			return this;
		}
		
		public Builder withFeedAmount(Double feedAmount) {
			this.feedAmount = feedAmount;
			return this;
		}
		
		public Builder withPrice(Double price) {
			this.price = price;
			return this;
		}

		@Override
		public FeedingAction build() {
			return new FeedingAction(this);
		}
		
	}
}