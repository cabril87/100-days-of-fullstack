using AutoMapper;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Profiles;

public class ReminderProfile : Profile
{
    public ReminderProfile()
    {
        // Reminder -> ReminderDTO
        CreateMap<Reminder, ReminderDTO>();
        
        // CreateReminderDTO -> Reminder
        CreateMap<CreateReminderDTO, Reminder>();
        
        // UpdateReminderDTO -> Reminder
        CreateMap<UpdateReminderDTO, Reminder>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
    }
} 