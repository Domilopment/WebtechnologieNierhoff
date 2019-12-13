const domain = "zweipluseins.de";
const port = "300";

const server_adress = "http://" + domain + ":" + port;

  const section = server_adress + "/api/section";
    const filteredData = section + "/filteredData";

  const post = server_adress + "/api/post";
    const newest = post + "/newest";
    const search = post + "/search/";
    const theID = post + "/id/";

  const login = server_adress + "/api/user/login";

  const favorite = server_adress + "/api/favorite";
    const favoriteget = favorite + "/get";

  const searchTags = server_adress + "/api/tags";

  const postTree = server_adress + "/api/tree";
    const videoInTree = postTree + "/video/";

  const postNode = server_adress + "/api/treenode";

  const postAll = server_adress + "/api/posts";

  const treeNode = server_adress + "/api/treenodes/";

export {
  domain,
  section,
  post,
  login,
  favorite,
  newest,
  search,
  theID,
  favoriteget,
  filteredData,
  searchTags,
  postTree,
  postNode,
  postAll,
  videoInTree,
  treeNode,
};
