<?php
include_once("../db/db.php");
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
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $username = $pathParameters['user'];
            if (!is_string($username)) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Invalid user name.';
                return json_encode($this->response);
            }

            try {
                $users = $this->connection->getUserByName($username);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }

            if (!$users) {
                $response['success'] = false;
                $response['error_message'] = 'User with name ' . $username . ' was not found.';
                return json_encode($response);
            }

            $users = array_values(array_filter($users, function ($v) {
                return $v != null;
            }));

            $users = array_map(function ($v) {
                return $this->dropSensitiveInformation($v);
            }, $users);
            $response['users'] = $users;
            $response['success'] = true;
            return json_encode($response);
        }
        $this->response['status'] = 'fail';
        $this->response['error_message'] = 'WRONG HTTP Request method.';
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