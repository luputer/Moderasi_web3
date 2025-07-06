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
  };

  private var nextId : Nat = 0;
  private var posts = HashMap.HashMap<Text, Post>(32, Text.equal, Text.hash);

  public shared(msg) func addPost(content : Text) : async Nat {
    if (Principal.isAnonymous(msg.caller)) {
      throw Error.reject("Anonymous users are not allowed.");
    };
    let post : Post = {
      id = nextId;
      author = msg.caller;
      content = content;
      votes = 0;
      voters = [];
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
        let updatedPost : Post = {
          id = post.id;
          author = post.author;
          content = post.content;
          votes = post.votes + 1;
          voters = Array.append<Principal>(post.voters, [msg.caller]);
        };
        posts.put(Nat.toText(id), updatedPost);
        return true;
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