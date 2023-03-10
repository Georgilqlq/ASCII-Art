<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class Fellow
{

    private $response;

    public function __construct()
    {
        $this->response = array();
    }

    public function updateFollower($request_type, $update)
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "No token"]);
        }
        $verifiedToken = JWT::verify($authHeader);
        if ($verifiedToken == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "Expired token"]);
        }
        if ($_SERVER['REQUEST_METHOD'] == $request_type) {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
            if (!array_key_exists('follower', $data) || $data['follower'] == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'Follower is not chosen.';
                return json_encode($this->response);
            }
            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $follower = $data['follower'];
            $user = $data['user'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if (!is_int($follower)) {
                $follower = (int) $follower;
            }
            if ($user <= 0 || $follower <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid ids.';
                return json_encode($this->response);
            }
            try {
                $update($user, $follower);
                return json_encode(['success'=>true,'token'=>$verifiedToken]);
            } catch (Exception $e) {
                $this->response['success'] = false;
                $this->response['error'] = $e->getMessage();
                return json_encode($this->response);
            }
        }
        $this->response['success'] = false;
        $this->response['error'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }

    public function getFellows($search, $search_key, $pathParameters)
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "No token"]);
        }
        $verifiedToken = JWT::verify($authHeader);
        if ($verifiedToken == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "Expired token"]);
        }
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            $user = $jwtUser['id'];
            if ($user == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            if (!array_key_exists('page', $pathParameters) || $pathParameters['page'] == null) {
                $page = null;
                $limit = null;
            } else {
                $page = $pathParameters['page'];
                $limit = 20;
            }

            if (!is_int($page)) {
                $page = (int) $page;
            }

            if ($page <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid page.';
                return json_encode($this->response);
            }

            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid user id.';
                return json_encode($this->response);
            }

            try {
                $fellows = $search($user, $page, $limit);
            } catch (Exception $e) {
                $this->response['success'] = false;
                $this->response['error'] = $e->getMessage();
                return json_encode($this->response);
            }

            $fellows = array_values(array_filter($fellows, function ($v) {
                return $v != null;
            }));

            $fellows = array_map(function ($v) {
                return $this->dropSensitiveInformation($v);
            }, $fellows);
            return json_encode([$search_key=>$fellows,'success'=>true,'token'=>$verifiedToken,'user'=>$user]);
        }
        $this->response['success'] = false;
        $this->response['error'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }

    private function dropSensitiveInformation($user)
    {
        unset($user['password_hash']);
        unset($user['roles']);
        unset($user['created_at']);
        for ($i = 0; $i < 5; ++$i) {
            unset($user[(string) $i]);
        }
        return $user;
    }

}
?>