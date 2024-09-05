# Action: Resource Scalar

The "Resource Scalar" action allows users to downscale resources for a specified time window.

## Description

Users can schedule the downscaling of resources using cron expressions. For example, you can set the replica count to 0 at night between 12 AM to 7 AM, or scale down resources to 1 on Sundays.

## User Inputs

### Scale Down Cron Expression
The cron expression for scaling down is specified in the trigger itself.

### Scale Up Cron Expression
The cron expression for scaling up is specified in the action text box labeled `cron_scale_up_time`.

### Scale Down Replica
Users can specify the number of replicas to downscale to during the specified time window. For example, if you want to decrease the resources to 0 at night, provide 0 here.

## Example Usage

1. **Night Time Downscale**:
    - Scale Down Cron Expression: `0 0 * * *` (Every night at 12 AM UTC)
    - Scale Up Cron Expression: `0 7 * * *` (Every morning at 7 AM UTC)
    - Scale Down Replica: `0` (Set replicas to 0)
    - Remember to change UTC time to your local time while configuration
        
        ex:- If user is in IST(Indian standard time) 
        the above cron will change accordingly.
        apply 30 18 * * * to get same effect as 12:00 am (IST)

2. **Sunday Downscale**:
    - Scale Down Cron Expression: `0 0 * * 0` (Every Sunday at 12 AM UTC)
    - Scale Up Cron Expression: `0 7 * * 1` (Every Monday at 7 AM UTC)
    - Scale Down Replica: `1` (Set replicas to 1)
