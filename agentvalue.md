ClearCollect(colValueData, 'Agent values');
 
Concurrent(
    // collections for value benefit stats
    ClearCollect(
        colValueBenefitCounts,
        ForAll(
            Distinct(
                colValueData,
                'Agent Value Benefit'
            ) As benefit,
            {
                ValueBenefit: benefit.Value,
                Count: CountRows(
                    Filter(
                        colValueData,
                        'Agent Value Benefit' = benefit.Value
                    )
                )
            }
        )
    ),
// provides data for dashboard charts (flat table) - SJ
    ClearCollect(
        colAgentTypeCounts,
        ForAll(
            Distinct(
                colValueData,
                'Agent Types'
            ),
            With(
                {currentType: ThisRecord.Value},
                {
                    AgentType: currentType,
                    Count: CountRows(
                        Filter(
                            colValueData,
                            'Agent Types' = currentType
                        )
                    )
                }
            )
        )
    ),
    ClearCollect(
        colClassificationDateTrend,
        AddColumns(
            Filter(
                colValueData,
                !IsBlank('Classification Date')
            ),
            weekLabel,
            Text(
                'Classification Date',
                "[$-en-US]mm-yyyy"
            ),
            sortDate, 'Classification Date' // added to fix casting issue
        ),
    // Collection for value benefit aggregation by environment
        ClearCollect(
            colValueByEnvironment,
            AddColumns(
                GroupBy(
                    Filter(
                        colValueData,
                        !IsBlank(EnvironmentDisplayName) && !IsBlank('Agent Value Benefit')
                    ),
                    EnvironmentDisplayName,
                    'Agent Value Benefit',
                    GroupedData
                ),
                Count,
                CountRows(GroupedData)
            )
        );
    ),
    // working out most common agent behavior
    ClearCollect(
        colAgentBenefit,
        ForAll(
            Distinct(
                colValueData,
                'Agent Behaviors'
            ),
            With(
                {currentType: ThisRecord.Value},
                {
                    AgentType: currentType,
                    Count: CountRows(
                        Filter(
                            colValueData,
                            'Agent Behaviors' = currentType
                        )
                    )
                }
            )
        )
    );    
);
// Tile for agent classification over time
ClearCollect(
    colGroupedClassificationTrend,
    AddColumns(
        GroupBy(
            colClassificationDateTrend,
            weekLabel,
            GroupedData
        ),
        TotalClassified,
        CountRows(GroupedData)
    )
);
// Total Agents count.
Set(
    AllAgentsCount,
    CountIf(
        'Agent Details',
        true
    )
);
// Working out most popular agent types and behaviors - SJ
Set(
    gloTotalAgents,
    CountIf(
        colValueData,
        true
    )
);
Set(
    AgentsClassified,
    CountIf(
        colValueData,
        true
    )
);
Set(
    AgentsClassifiedPercentage,
    If(gloTotalAgents = 0, 0, Round(
        AllAgentsCount / gloTotalAgents * 100,
        0
    ))
);
// identify the most popular agent - SJ
Set(
    gloMaxAgentTypeCount,
    If(gloTotalAgents = 0, 0,
    Max(
        colAgentTypeCounts,
        Count
    ))
);
Set(
    gloTopAgentType,
    LookUp(
        colAgentTypeCounts,
        Count = gloMaxAgentTypeCount,
        AgentType
    )
);
// calculate percentage for most popular - SJ
Set(
    gloTopAgentPercentage,
    If(gloTotalAgents = 0, 0,
    (Round(
        Max(
            colAgentTypeCounts,
            Count
        ) / gloTotalAgents * 100,
        0
    )))
);
Set(
    gloValueSaturation,
    If(gloTotalAgents = 0, 0,
    Round(
        CountRows(
            Filter(
                colValueData,
                Not IsBlank('Agent Value Benefit')
            )
        ) / gloTotalAgents * 100,
        0
    ))
);
Set(
    gloUntappedAgents,
    AllAgentsCount - gloTotalAgents
);
Set(
    gloUntappedPercent,
    Round(
        (gloUntappedAgents / Max(
            gloTotalAgents,
            1
        )) * 100,
        0
    )
);
Set(
    gloMaxAgentBenefitCount,
    Max(
        colAgentBenefit,
        Count
    )
);
Set(
    gloTopAgentBehaviorBenefit,
    LookUp(
        colAgentBenefit,
        Count = gloMaxAgentBenefitCount,
        AgentType
    )
);
// calculate percentage for most popular - SJ
Set(
    gloTopAgentBehaviorPercentage,
    If(gloTotalAgents = 0, 0,
    (Round(
        Max(
            colAgentBenefit,
            Count
        ) / gloTotalAgents * 100,
        0
    )))
);