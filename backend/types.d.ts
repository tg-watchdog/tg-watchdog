type Query = {
  token: string,
  tglogin: TGLogin,
  request_query: {
    chat_id: number,
    msg_id: number,
    timestamp: number,
    signature: string
  }
}

type TGUser = {
  id: number,
  first_name: string,
  last_name: string,
  username: string
}

type TGLogin = {
  query_id: string,
  user: string,
  auth_date: number,
  hash: string,
  [key: string]: string | number
}