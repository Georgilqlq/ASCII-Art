<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class User
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }

    public function getUserByName()
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
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error'] = 'User is not chosen.';
                return json_encode($this->response);
            }
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            $owner = $jwtUser['id'];
            if ($owner == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'Owner is not chosen.';
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

            if (!is_int($owner)) {
                $owner = (int) $owner;
            }

            if ($owner <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid owner id.';
                return json_encode($this->response);
            }

            $username = $pathParameters['user'];
            if (!is_string($username)) {
                $this->response['status'] = 'fail';
                $this->response['error'] = 'Invalid user name.';
                return json_encode($this->response);
            }

            try {
                $users = $this->connection->getUserByName($username, $page, $limit, $owner);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error'] = $e->getMessage();
                return json_encode($response);
            }

            if (!$users) {
                $response['success'] = true;
                $response['error'] = 'User with name ' . $username . ' was not found.';
                return json_encode(['success' => true, 'users' => [], 'token' => $verifiedToken, 'user' => $owner, 'error' => 'User with name ' . $username . ' was not found.']);
            }

            $users = array_values(array_filter($users, function ($v) {
                return $v != null;
            }));

            $users = array_map(function ($v) {
                return $this->dropSensitiveInformation($v);
            }, $users);

            return json_encode(['success' => true, 'users' => $users, 'token' => $verifiedToken, 'user' => $owner]);
        }
        $this->response['status'] = 'fail';
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

$user = new User();
echo $user->getUserByName();
?>