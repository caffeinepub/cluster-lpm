import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import List "mo:core/List";
import VarArray "mo:core/VarArray";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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
  let users = Map.empty<Principal, UserProfile>();
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

  func existsAdminUser() : Bool {
    for ((_, user) in users.entries()) {
      switch (user.role) {
        case (#admin) { return true };
        case (_) {};
      };
    };
    false;
  };

  public query ({ caller }) func getAllUsersProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view all users profiles");
    };
    let result = List.empty<(Principal, UserProfile)>();
    for ((principal, profile) in users.entries()) {
      result.add((principal, profile));
    };
    result.toArray();
  };

  public shared ({ caller }) func createUser(
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create users");
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

    let currentUser = nextUserId;
    nextUserId += 1;

    // Check if username already exists (case-insensitive and trimmed)
    let normalizedUsername = username.toLower().trim(#char(' '));
    let usernameExists = users.values().any(
      func(profile) {
        profile.username.toLower().trim(#char(' ')) == normalizedUsername
      }
    );

    if (usernameExists) {
      Runtime.trap("Username already exists");
    };

    // Add new user profile
    let newProfile : UserProfile = {
      name;
      username;
      hotelId;
      securityManager;
      contactNumber;
      isActive;
      password;
      role;
    };
    users.add(caller, newProfile);

    let accessControlRole = switch (role) {
      case (#admin) { #admin };
      case (#user) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

    recordAuditLog(caller, "CREATE_USER", hotelId, "Created user: " # username);
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    users.add(caller, updatedProfile);

    let accessControlRole = switch (role) {
      case (#admin) { #admin };
      case (#user) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

    recordAuditLog(caller, "UPDATE_USER", hotelId, "Updated user: " # username);
  };

  public shared ({ caller }) func deleteUser(userId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete users");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        users.remove(caller);
        recordAuditLog(caller, "DELETE_USER", null, "Deleted user: " # user.username);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(userId : Text) : async ?UserProfile {
    if (userId != caller.toText() and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Check if this is bootstrap scenario: first admin self-registration
    let isBootstrap = not existsAdminUser() and (switch (profile.role) {
      case (#admin) { true };
      case (_) { false };
    });

    if (isBootstrap) {
      // Bootstrap scenario: Allow first admin to self-register without authorization
      // Validate hotel if specified
      switch (profile.hotelId) {
        case (?hId) {
          switch (hotels.get(hId)) {
            case (null) { Runtime.trap("Hotel not found") };
            case (?_) {};
          };
        };
        case (null) {};
      };

      // Save the profile
      users.add(caller, profile);

      // Assign admin role in access control system
      AccessControl.assignRole(accessControlState, caller, caller, #admin);

      recordAuditLog(caller, "BOOTSTRAP_ADMIN", profile.hotelId, "Created first admin: " # profile.username);
    } else {
      // Normal scenario: Require authorization
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only users can save profiles");
      };

      // Check if user exists
      switch (users.get(caller)) {
        case (?existingProfile) {
          // Updating existing profile
          // Check if role is being changed
          if (existingProfile.role != profile.role) {
            // Only admins can change roles
            if (not (AccessControl.isAdmin(accessControlState, caller))) {
              Runtime.trap("Unauthorized: Only admins can change user roles");
            };
          };
        };
        case (null) {
          // Creating new user profile
          // Only admins can create new users
          if (not (AccessControl.isAdmin(accessControlState, caller))) {
            Runtime.trap("Unauthorized: Only admins can create new users");
          };
        };
      };

      // Validate hotel if specified
      switch (profile.hotelId) {
        case (?hId) {
          switch (hotels.get(hId)) {
            case (null) { Runtime.trap("Hotel not found") };
            case (?_) {};
          };
        };
        case (null) {};
      };

      // Save the profile
      users.add(caller, profile);

      // Assign role in access control system
      let accessControlRole = switch (profile.role) {
        case (#admin) { #admin };
        case (#user) { #user };
      };

      AccessControl.assignRole(accessControlState, caller, caller, accessControlRole);

      recordAuditLog(caller, "SAVE_PROFILE", profile.hotelId, "Saved profile: " # profile.username);
    };
  };

  public query ({ caller }) func getAllHotels() : async [Hotel] {
    hotels.values().toArray().sort(Hotel.compareByName);
  };

  public shared ({ caller }) func updateHotel(hotelId : Nat, name : Text, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can update hotels");
    };
    switch (hotels.get(hotelId)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (?existing) {
        hotels.add(hotelId, { existing with name; isActive });
        recordAuditLog(caller, "UPDATE_HOTEL", ?hotelId, "Updated hotel: " # name);
      };
    };
  };

  public shared ({ caller }) func deleteHotel(hotelId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can delete hotels");
    };

    switch (hotels.get(hotelId)) {
      case (null) { Runtime.trap("Hotel not found") };
      case (?hotel) {
        hotels.remove(hotelId);
        recordAuditLog(caller, "DELETE_HOTEL", ?hotelId, "Deleted hotel: " # hotel.name);
      };
    };
  };

  public shared ({ caller }) func createManualHotel(id : Nat, name : Text, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create hotels");
    };

    switch (hotels.get(id)) {
      case (null) {
        let newHotel : Hotel = {
          id;
          name;
          isActive;
        };
        hotels.add(id, newHotel);
        recordAuditLog(caller, "CREATE_HOTEL", ?id, "Created hotel: " # name);
      };
      case (?_) {
        Runtime.trap("Hotel with that ID already exists");
      };
    };
  };

  public shared ({ caller }) func createTask(title : Text, description : Text, dueDate : Time.Time, priority : Text, hotelIds : [Nat]) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can create tasks");
    };

    let taskId = "task_" # Time.now().toText();

    let newTask : Task = {
      id = taskId;
      title;
      description;
      dueDate;
      priority;
      status = "Open";
      hotelIds;
      assignedUsers = [];
      creator = caller;
    };

    tasks.add(taskId, newTask);
    recordAuditLog(caller, "CREATE_TASK", null, "Created task: " # title);
    taskId;
  };

  public shared ({ caller }) func assignUserToTask(taskId : Text, user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
        recordAuditLog(caller, "ASSIGN_TASK", null, "Assigned user to task: " # taskId);
      };
    };
  };

  public shared ({ caller }) func assignTaskToAllUsersOfHotel(taskId : Text, hotelId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can assign tasks");
    };

    switch (tasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        recordAuditLog(caller, "ASSIGN_TASK_HOTEL", ?hotelId, "Assigned task to hotel: " # taskId);
      };
    };
  };

  public shared ({ caller }) func assignTaskToAllUsersOfHotels(taskId : Text, hotelIds : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can assign tasks to multiple hotels");
    };

    for (hotelId in hotelIds.values()) {
      await assignTaskToAllUsersOfHotel(taskId, hotelId);
    };
  };

  public query ({ caller }) func getTask(taskId : Text) : async ?Task {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.get(taskId);
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    tasks.values().toArray().sort(Task.compareByDueDate);
  };

  public shared ({ caller }) func addComment(taskId : Text, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
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
      };
    };
  };

  public query ({ caller }) func getTaskComments(taskId : Text) : async [TaskComment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };
    taskComments.toArray().filter(func(comment) { comment.taskId == taskId });
  };

  public query ({ caller }) func getAuditLogs() : async [AuditLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view audit logs");
    };
    auditLogs.toArray();
  };
};
