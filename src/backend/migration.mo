import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Text "mo:core/Text";

module {
  type ActorV1 = {
    hotels : Map.Map<Nat, { id : Nat; name : Text; isActive : Bool }>;
    hotelUsers : Map.Map<Principal, { username : Text; hotelId : Nat; isActive : Bool }>;
    dailyReports : Map.Map<Text, {
      id : Text;
      hotelId : Nat;
      author : Principal;
      timestamp : Time.Time;
      occupancy : Nat;
      vipArrivals : Nat;
      guestIncidents : Nat;
      staffIncidents : Nat;
      guestComplaints : Nat;
      guestInjuries : Nat;
      staffInjuries : Nat;
    }>;
    emergencies : Map.Map<Text, {
      id : Text;
      category : Text;
      details : Text;
      severity : Text;
      timestamp : Time.Time;
      hotelId : Nat;
      reporter : Principal;
      notificationResults : [Text];
    }>;
    tasks : Map.Map<Text, {
      id : Text;
      title : Text;
      description : Text;
      dueDate : Time.Time;
      priority : Text;
      status : Text;
      hotelIds : [Nat];
      assignedUsers : [Principal];
      creator : Principal;
    }>;
    taskComments : List.List<{
      taskId : Text;
      author : Principal;
      comment : Text;
      timestamp : Time.Time;
    }>;
    auditLogs : List.List<{
      id : Text;
      timestamp : Time.Time;
      actorPrincipal : Principal;
      action : Text;
      hotelId : ?Nat;
      details : Text;
    }>;
    emergencyRecipients : Set.Set<Text>;
    users : Map.Map<Principal, {
      name : Text;
      username : Text;
      hotelId : ?Nat;
      securityManager : ?Text;
      contactNumber : ?Text;
      isActive : Bool;
      password : Text;
      role : { #admin; #user };
    }>;
  };

  type ActorV2 = {
    hotels : Map.Map<Nat, { id : Nat; name : Text; isActive : Bool }>;
    hotelUsers : Map.Map<Principal, { username : Text; hotelId : Nat; isActive : Bool }>;
    dailyReports : Map.Map<Text, {
      id : Text;
      hotelId : Nat;
      author : Principal;
      timestamp : Time.Time;
      occupancy : Nat;
      vipArrivals : Nat;
      guestIncidents : Nat;
      staffIncidents : Nat;
      guestComplaints : Nat;
      guestInjuries : Nat;
      staffInjuries : Nat;
    }>;
    emergencies : Map.Map<Text, {
      id : Text;
      category : Text;
      details : Text;
      severity : Text;
      timestamp : Time.Time;
      hotelId : Nat;
      reporter : Principal;
      notificationResults : [Text];
    }>;
    tasks : Map.Map<Text, {
      id : Text;
      title : Text;
      description : Text;
      dueDate : Time.Time;
      priority : Text;
      status : Text;
      hotelIds : [Nat];
      assignedUsers : [Principal];
      creator : Principal;
    }>;
    taskComments : List.List<{
      taskId : Text;
      author : Principal;
      comment : Text;
      timestamp : Time.Time;
    }>;
    auditLogs : List.List<{
      id : Text;
      timestamp : Time.Time;
      actorPrincipal : Principal;
      action : Text;
      hotelId : ?Nat;
      details : Text;
    }>;
    emergencyRecipients : Set.Set<Text>;
    users : Map.Map<Text, {
      name : Text;
      username : Text;
      hotelId : ?Nat;
      securityManager : ?Text;
      contactNumber : ?Text;
      isActive : Bool;
      password : Text;
      role : { #admin; #user };
    }>;
    nextUserId : Nat;
  };

  public func run(old : ActorV1) : ActorV2 {
    let newUsers = Map.empty<Text, { name : Text; username : Text; hotelId : ?Nat; securityManager : ?Text; contactNumber : ?Text; isActive : Bool; password : Text; role : { #admin; #user } }>();
    for ((principal, profile) in old.users.entries()) {
      newUsers.add(principal.toText(), profile);
    };
    { old with users = newUsers; nextUserId = 1 : Nat };
  };
};
