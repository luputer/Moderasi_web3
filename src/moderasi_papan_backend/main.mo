import Nat "mo:base/Nat";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Error "mo:base/Error";

actor {
  type Post = {
    id : Nat;
    author : Principal;
    content : Text;
    votes : Nat;
    voters : [Principal];
    username : Text; // Store username with post
  };

  private var nextId : Nat = 0;
  private var posts = HashMap.HashMap<Text, Post>(32, Text.equal, Text.hash);

  // Map principal to (username, passwordHash)
  private var userMap = HashMap.HashMap<Principal, (Text, Text)>(32, Principal.equal, Principal.hash);

  // Register username and password hash for the current principal
  public shared(msg) func register(username: Text, passwordHash: Text) : async Bool {
    if (Principal.isAnonymous(msg.caller)) return false;
    userMap.put(msg.caller, (username, passwordHash));
    return true;
  };

  // Verify username and password hash for the current principal
  public query func verify(username: Text, passwordHash: Text, p: Principal) : async Bool {
    switch (userMap.get(p)) {
      case (null) { return false };
      case (?data) {
        let (savedUsername, savedHash) = data;
        return savedUsername == username and savedHash == passwordHash;
      }
    }
  };

  // Get username for a principal
  public query func getUsername(p: Principal) : async ?Text {
    switch (userMap.get(p)) {
      case (null) { return null };
      case (?data) { return ?data.0 };
    }
  };

  public shared(msg) func addPost(content : Text) : async Nat {
    if (Principal.isAnonymous(msg.caller)) {
      throw Error.reject("Anonymous users are not allowed.");
    };
    let username = switch (userMap.get(msg.caller)) {
      case (null) { "Unknown" };
      case (?data) { data.0 };
    };
    let post : Post = {
      id = nextId;
      author = msg.caller;
      content = content;
      votes = 0;
      voters = [];
      username = username;
    };
    posts.put(Nat.toText(nextId), post);
    nextId += 1;
    return post.id;
  };

  public query func getPosts() : async [Post] {
    Iter.toArray(posts.vals());
  };

  public shared(msg) func votePost(id : Nat) : async Bool {
    if (Principal.isAnonymous(msg.caller)) {
      throw Error.reject("Anonymous users are not allowed.");
    };
    switch (posts.get(Nat.toText(id))) {
      case (null) { return false };
      case (?post) {
        if (Array.find<Principal>(post.voters, func x = x == msg.caller) != null) { return false };
        let updatedVotes = post.votes + 1;
        let updatedPost : Post = {
          id = post.id;
          author = post.author;
          content = post.content;
          votes = updatedVotes;
          voters = Array.append<Principal>(post.voters, [msg.caller]);
          username = post.username;
        };
        if (updatedVotes > 3) {
          // Jika vote lebih dari 3, hapus post
          ignore posts.remove(Nat.toText(id));
          return true;
        } else {
          posts.put(Nat.toText(id), updatedPost);
          return true;
        }
      }
    }
};

  public shared(msg) func deletePost(id : Nat) : async Bool {
    if (Principal.isAnonymous(msg.caller)) {
      throw Error.reject("Anonymous users are not allowed.");
    };
    switch (posts.get(Nat.toText(id))) {
      case (null) { return false };
      case (?post) {
        if (post.author != msg.caller) { return false };
        ignore posts.remove(Nat.toText(id));
        return true;
      }
    }
  };
}