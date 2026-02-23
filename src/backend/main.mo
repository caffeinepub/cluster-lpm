import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import VarArray "mo:core/VarArray";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Hotel = {
    id : Nat;
    name : Text;
    isActive : Bool;
  };

  type HotelUserProfile = {
    username : Text;
    hotelId : Nat;
    isActive : Bool;
  };

  type UserRole = {
    #admin;
    #user;
  };

  type UserProfile = {
    name : Text;
    username : Text;
    hotelId : ?Nat;
    securityManager : ?Text;
    contactNumber : ?Text;
    isActive : Bool;
    password : Text;
    role : UserRole;
  };

  type DailyReport = {
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
  };

  type Emergency = {
    id : Text;
    category : Text;
    details : Text;
    severity : Text;
    timestamp : Time.Time;
    hotelId : Nat;
    reporter : Principal;
    notificationResults : [Text];
  };

  type Task = {
    id : Text;
    title : Text;
    description : Text;
    dueDate : Time.Time;
    priority : Text;
    status : Text;
    hotelIds : [Nat];
    assignedUsers : [Principal];
    creator : Principal;
  };

  type TaskComment = {
    taskId : Text;
    author : Principal;
    comment : Text;
    timestamp : Time.Time;
  };

  type AuditLog = {
    id : Text;
    timestamp : Time.Time;
    actorPrincipal : Principal;
    action : Text;
    hotelId : ?Nat;
    details : Text;
  };

  let hotelUsers = Map.empty<Principal, HotelUserProfile>();
  let hotels = Map.empty<Nat, Hotel>();
  let dailyReports = Map.empty<Text, DailyReport>();
  let emergencies = Map.empty<Text, Emergency>();
  let tasks = Map.empty<Text, Task>();
  let taskComments = List.empty<TaskComment>();
  let auditLogs = List.empty<AuditLog>();
  let emergencyRecipients = Set.empty<Text>();
  let users = Map.empty<Text, UserProfile>();
  var nextUserId = 1;

  // Authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Task {
    public func compareByDueDate(a : Task, b : Task) : Order.Order {
      if (a.dueDate < b.dueDate) { #less } else if (a.dueDate > b.dueDate) { #greater } else { #equal };
    };

    public func compareByStatus(a : Task, b : Task) : Order.Order {
      Text.compare(a.status, b.status);
    };
  };

  module Hotel {
    public func compareByName(a : Hotel, b : Hotel) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  // Init default hotels
  let defaultHotels = [
    "Sunset Resort",
    "Oceanview Inn",
    "City Central Hotel",
    "Mountain Lodge",
    "Lakeside Retreat",
    "Royal Palace",
    "Seaside Bungalow",
    "Urban Oasis",
    "Grand Heritage",
    "Cosmopolitan Suites",
  ];

  let varArray = VarArray.repeat<Nat>(0, 9);
  for (i in Nat.range(0, 9)) {
    hotels.add(
      i + 1,
      { id = i + 1; name = defaultHotels[i]; isActive = true },
    );
  };

  func verifyUserIsActive(caller : Principal) : Bool {
    switch (hotelUsers.get(caller)) {
      case (null) { false };
      case (?profile) { profile.isActive };
    };
  };

  func recordAuditLog(caller : Principal, action : Text, hotelId : ?Nat, details : Text) {
    let log : AuditLog = {
      id = "log_" # Time.now().toText();
      timestamp = Time.now();
      actorPrincipal = caller;
      action;
      hotelId;
      details;
    };
    auditLogs.add(log);
  };

  public query ({ caller }) func getAllUsersProfiles() : async [(Text, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all users profiles");
    };
    users.entries().toArray();
  };

  public shared ({ caller }) func createUser(
    name : Text,
    username : Text,
    hotelId : ?Nat,
    securityManager : ?Text,
    contactNumber : ?Text,
    password : Text,
    role : UserRole,
  ) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create users");
    };

    // SECURITY: Prevent privilege escalation - only allow creating regular users
    // Creating admin users should be restricted or require special authorization
    switch (role) {
      case (#admin) {
        // Additional security: Log admin creation attempts for audit
        recordAuditLog(caller, "ADMIN_CREATION_ATTEMPT", hotelId, "Attempted to create admin user: " # username);
        Runtime.trap("Unauthorized: Creating admin users is restricted. Contact system administrator.");
      };
      case (#user) {
        // Regular user creation is allowed
      };
    };

    switch (hotelId) {
      case (?hId) {
        switch (hotels.get(hId)) {
          case (null) { Runtime.trap("Hotel not found") };
          case (?_) {};
        };
      };
      case (null) {};
    };

    let newUserId = nextUserId.toText();
    nextUserId += 1;

    switch (users.get(newUserId)) {
      case (?_) { Runtime.trap("User already exists") };
      case (null) {
        let newProfile : UserProfile = {
          name;
          username;
          hotelId;
          securityManager;
          contactNumber;
          isActive = true;
          password;
          role;
        };
        users.add(newUserId, newProfile);

        let accessControlRole = switch (role) {
          case (#admin) { #admin };
          case (#user) { #user };
        };
        AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

        recordAuditLog(caller, "USER_CREATED", hotelId, "Admin created user: " # username);
        newUserId;
      };
    };
  };

  public shared ({ caller }) func updateUser(
    userId : Text,
    name : Text,
    username : Text,
    hotelId : ?Nat,
    securityManager : ?Text,
    contactNumber : ?Text,
    isActive : Bool,
    password : Text,
    role : UserRole,
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update users");
    };

    switch (hotelId) {
      case (?hId) {
        switch (hotels.get(hId)) {
          case (null) { Runtime.trap("Hotel not found") };
          case (?_) {};
        };
      };
      case (null) {};
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?oldProfile) {
        // SECURITY: Prevent privilege escalation via role change
        // Only allow changing role from user to user, not to admin
        if (oldProfile.role != role) {
          switch (role) {
            case (#admin) {
              recordAuditLog(caller, "PRIVILEGE_ESCALATION_ATTEMPT", hotelId, "Attempted to elevate user to admin: " # username);
              Runtime.trap("Unauthorized: Elevating users to admin role is restricted. Contact system administrator.");
            };
            case (#user) {
              // Downgrading from admin to user could be allowed, but log it
              if (oldProfile.role == #admin) {
                recordAuditLog(caller, "ADMIN_ROLE_REMOVED", hotelId, "Admin role removed from user: " # username);
              };
            };
          };
        };

        let updatedProfile : UserProfile = {
          name;
          username;
          hotelId;
          securityManager;
          contactNumber;
          isActive;
          password;
          role;
        };
        users.add(userId, updatedProfile);

        if (oldProfile.role != role) {
          let accessControlRole = switch (role) {
            case (#admin) { #admin };
            case (#user) { #user };
          };
          AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);
        };

        recordAuditLog(caller, "USER_UPDATED", hotelId, "Admin updated user: " # username);
      };
    };
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete users");
    };

    if (caller.toText() == userId) {
      Runtime.trap("Unauthorized: Cannot delete your own account");
    };

    switch (users.get(userId)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) {
        // SECURITY: Log admin deletions for audit trail
        if (profile.role == #admin) {
          recordAuditLog(caller, "ADMIN_USER_DELETED", profile.hotelId, "Admin deleted admin user: " # profile.username);
        };

        users.remove(userId);
        recordAuditLog(caller, "USER_DELETED", profile.hotelId, "Admin deleted user: " # profile.username);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    users.get(caller.toText());
  };

  public query ({ caller }) func getUserProfile(userId : Text) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(userId);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (users.get(caller.toText())) {
      case (null) {
        Runtime.trap("User profile does not exist. Contact administrator to create your account.");
      };
      case (?existingProfile) {
        // SECURITY: Prevent users from changing their own role or critical fields
        if (profile.role != existingProfile.role) {
          Runtime.trap("Unauthorized: Cannot change your own role");
        };

        if (profile.hotelId != existingProfile.hotelId) {
          Runtime.trap("Unauthorized: Cannot change your own hotel assignment");
        };

        if (profile.isActive != existingProfile.isActive) {
          Runtime.trap("Unauthorized: Cannot change your own active status");
        };

        let updatedProfile : UserProfile = {
          name = profile.name;
          username = profile.username;
          hotelId = existingProfile.hotelId;
          securityManager = profile.securityManager;
          contactNumber = profile.contactNumber;
          isActive = existingProfile.isActive;
          password = profile.password;
          role = existingProfile.role;
        };
        users.add(caller.toText(), updatedProfile);
        recordAuditLog(caller, "PROFILE_UPDATED", existingProfile.hotelId, "User updated their profile");
      };
    };
  };

  public query ({ caller }) func getAllHotels() : async [Hotel] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view hotels");
    };
    hotels.values().toArray().sort(Hotel.compareByName);
  };

  public shared ({ caller }) func updateHotel(hotelId : Nat, name : Text, isActive : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update hotels");
    };

    switch (hotels.get(hotelId)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (?existing) {
        let updated : Hotel = {
          id = hotelId;
          name;
          isActive;
        };
        hotels.add(hotelId, updated);
        recordAuditLog(caller, "HOTEL_UPDATED", ?hotelId, "Updated hotel: " # name);
      };
    };
  };

  public shared ({ caller }) func deleteHotel(hotelId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete hotels");
    };

    switch (hotels.get(hotelId)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (?hotel) {
        hotels.remove(hotelId);
        recordAuditLog(caller, "HOTEL_DELETED", ?hotelId, "Deleted hotel: " # hotel.name);
      };
    };
  };

  public shared ({ caller }) func createManualHotel(id : Nat, name : Text, isActive : Bool) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create hotels");
    };

    switch (hotels.get(id)) {
      case (null) {
        let newHotel : Hotel = {
          id = id;
          name;
          isActive;
        };
        hotels.add(id, newHotel);
        recordAuditLog(caller, "HOTEL_CREATED", ?id, "Created new hotel: " # name);
      };
      case (?_) {
        Runtime.trap("Hotel with that ID already exists");
      };
    };
  };

  public shared ({ caller }) func createTask(title : Text, description : Text, dueDate : Time.Time, priority : Text, hotelIds : [Nat]) : async Text {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create tasks");
    };

    let validHotels = hotelIds.filter(func(hotelId) { switch (hotels.get(hotelId)) { case (?h) { h.isActive }; case (null) { false } } });

    let taskId = "task_" # Time.now().toText();

    var assignedUsers : [Principal] = [];
    for (hotelId in validHotels.values()) {
      let hotelUsersList = users.entries().toArray().filter(func((_, profile)) {
        switch (profile.hotelId) {
          case (?hId) { hId == hotelId and profile.isActive };
          case (null) { false };
        };
      });

      for ((userId, _) in hotelUsersList.values()) {
        assignedUsers := assignedUsers.concat([caller]);
      };
    };

    let newTask : Task = {
      id = taskId;
      title;
      description;
      dueDate;
      priority;
      status = "Open";
      hotelIds = validHotels;
      assignedUsers;
      creator = caller;
    };

    tasks.add(taskId, newTask);

    recordAuditLog(caller, "TASK_CREATED", null, "Task created: " # title # " for hotels: " # validHotels.toText() # " with " # assignedUsers.size().toText() # " assigned users");
    taskId;
  };

  public shared ({ caller }) func assignUserToTask(taskId : Text, user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can assign users to tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?existing) {
        let updated : Task = {
          existing with
          assignedUsers = existing.assignedUsers.concat([user]);
        };
        tasks.add(taskId, updated);
        recordAuditLog(caller, "USER_ASSIGNED_TO_TASK", null, "User assigned to task: " # taskId);
      };
    };
  };

  public shared ({ caller }) func assignTaskToAllUsersOfHotel(taskId : Text, hotelId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can assign tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        let hotelUsersList = users.entries().toArray().filter(func((_, profile)) {
          switch (profile.hotelId) {
            case (?hId) { hId == hotelId and profile.isActive };
            case (null) { false };
          };
        });

        var updatedAssignedUsers = task.assignedUsers;

        for ((userId, _) in hotelUsersList.values()) {
          updatedAssignedUsers := updatedAssignedUsers.concat([caller]);
        };

        let updatedTask : Task = {
          task with
          assignedUsers = updatedAssignedUsers;
        };
        tasks.add(taskId, updatedTask);

        recordAuditLog(caller, "TASK_ASSIGNED_TO_HOTEL", ?hotelId, "Task assigned to all users of hotel: " # hotelId.toText());
      };
    };
  };

  public shared ({ caller }) func assignTaskToAllUsersOfHotels(taskId : Text, hotelIds : [Nat]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can assign tasks to multiple hotels");
    };

    for (hotelId in hotelIds.values()) {
      await assignTaskToAllUsersOfHotel(taskId, hotelId);
    };
  };

  public query ({ caller }) func getTask(taskId : Text) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };
    tasks.get(taskId);
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view tasks");
    };
    tasks.values().toArray().sort(Task.compareByDueDate);
  };

  public shared ({ caller }) func addComment(taskId : Text, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add comments");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?_) {
        let newComment : TaskComment = {
          taskId;
          author = caller;
          comment;
          timestamp = Time.now();
        };
        taskComments.add(newComment);
        recordAuditLog(caller, "TASK_COMMENT_ADDED", null, "Comment added to task: " # taskId);
      };
    };
  };

  public query ({ caller }) func getTaskComments(taskId : Text) : async [TaskComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view comments");
    };
    taskComments.toArray().filter(func(comment) { comment.taskId == taskId });
  };

  public query ({ caller }) func getAuditLogs() : async [AuditLog] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view audit logs");
    };
    auditLogs.toArray();
  };
};
