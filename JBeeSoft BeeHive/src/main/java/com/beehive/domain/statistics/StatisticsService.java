package com.beehive.domain.statistics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.beehive.domain.action.ActionService;
import com.beehive.domain.action.feeding.FeedingAction;
import com.beehive.domain.action.honeycollecting.HoneyCollectingAction;
import com.beehive.domain.action.treatment.TreatmentAction;
import com.beehive.domain.hive.Hive;
import com.beehive.infrastructure.payload.StatisticsDTO;

@Service
public class StatisticsService {
	
	@Autowired
	ActionService actionService;

	public List<StatisticsDTO> getFeedingStatisticsForHives(Set<Hive> hives, Date start, Date end) {
		
		List<FeedingAction> feedingActions = actionService.getFeedingActionsPerformedOnHives(hives,start, end);
		
		Map<String, List<QuantityStatistic>> quantityMap = feedingActions
				.stream()
				.collect(Collectors.groupingBy(FeedingAction::getFeedType, Collectors.mapping(this::mapFeedingActionToQuantityStatistic, Collectors.toList())));
		
		return generateStatisticsDTOsForMap(quantityMap);
	}
	
	public List<StatisticsDTO> getTreatmentStatisticsForHives(Set<Hive> hives, Date start, Date end) {
		
		List<TreatmentAction> treatmentAction = actionService.getTreatmentActionPerformedOnHives(hives,start, end);
		
		Map<String, List<QuantityStatistic>> quantityMap = treatmentAction
				.stream()
				.collect(Collectors.groupingBy(TreatmentAction::getAppliedMedicine, Collectors.mapping(this::mapTreatmentActionToQuantityStatistic, Collectors.toList())));
		
		return generateStatisticsDTOsForMap(quantityMap);
	}
	
	public List<StatisticsDTO> getHoneyStatisticsForHives(Set<Hive> hives, Date start, Date end) {
		
		List<HoneyCollectingAction> honeyCollectingActions = actionService.getHoneyCollectingActionPerformedOnHives(hives,start, end);
		
		Map<String, List<QuantityStatistic>> quantityMap = honeyCollectingActions
				.stream()
				.collect(Collectors.groupingBy(HoneyCollectingAction::getHoneyTypeName, Collectors.mapping(this::mapHoneyCollectingActionToQuantityStatistic, Collectors.toList())));
		
		return generateStatisticsDTOsForMap(quantityMap);
	}
	
	
	public QuantityStatistic mapFeedingActionToQuantityStatistic(FeedingAction action) {
		int numberHives = action.getAffectedHives().size();
		Double averageAmount = action.getFeedAmount()/numberHives;
		
		return QuantityStatistic.builder()
				.withActionName("Feeding Action")
				.withTypeName(action.getFeedType())
				.withAmount(averageAmount)
				.withPrice(action.getPrice())
				.build();
	}
	
	public QuantityStatistic mapTreatmentActionToQuantityStatistic(TreatmentAction action) {
		int numberHives = action.getAffectedHives().size();
		Double averageAmount = action.getDose()/numberHives;
		
		return QuantityStatistic.builder()
				.withActionName("Treatment Action")
				.withTypeName(action.getAppliedMedicine())
				.withAmount(averageAmount)
				.withPrice(action.getPrice())
				.build();
	}
	
	public QuantityStatistic mapHoneyCollectingActionToQuantityStatistic(HoneyCollectingAction action) {
		int numberHives = action.getAffectedHives().size();
		Double averageAmount = action.getHoneyAmount()/numberHives;
		
		return QuantityStatistic.builder()
				.withActionName("Honey Action")
				.withTypeName(action.getHoneyType().getName())
				.withAmount(averageAmount)
				.withPrice(action.getHoneyType().getPrice())
				.build();
	}
	
	public StatisticsDTO calculateStatistics(String typeName, List<QuantityStatistic> statistics) {
		
		Double amount=0.0;
		BigDecimal averagePrice = new BigDecimal(0.0);
		BigDecimal totalPrice = new BigDecimal(0.0);
		BigDecimal tmpAmount = new BigDecimal(0.0);
		BigDecimal tmpPrice = new BigDecimal(0.0);
		
		for (var stat : statistics) {
			amount += stat.getAmount();
			tmpAmount = new BigDecimal(stat.getAmount());
			tmpPrice =stat.getPrice();
			tmpPrice = tmpPrice.multiply(tmpAmount);
			totalPrice = totalPrice.add(tmpPrice);
		}
		
		averagePrice = totalPrice.divide(new BigDecimal(amount), RoundingMode.HALF_EVEN).setScale(2, RoundingMode.HALF_EVEN);
		totalPrice = totalPrice.setScale(2, RoundingMode.HALF_EVEN);
		
		return StatisticsDTO.builder()
				.withName(typeName)
				.withAmount(amount)
				.withAveragePrice(averagePrice)
				.withTotalPrice(totalPrice)
				.build();
	}
	
	private List<StatisticsDTO> generateStatisticsDTOsForMap(Map<String, List<QuantityStatistic>> quantityMap){
		List<StatisticsDTO> statisticsDTOs = new ArrayList<>();
		for (var entry : quantityMap.entrySet()){
			statisticsDTOs.add(calculateStatistics(entry.getKey(),entry.getValue()));
		}
		
		return statisticsDTOs;
	}
	
}