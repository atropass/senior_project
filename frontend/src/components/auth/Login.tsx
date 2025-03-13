import {
  Container,
  Title,
  Text,
  Anchor,
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Group,
  Checkbox,
  Button,
  Divider,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useUnit } from "effector-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginFormSubmitted,
  $loginPending,
  $loginSuccess,
  $loginError,
} from "../../features/auth/login";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginPending, loginSuccess, loginError, login] = useUnit([
    $loginPending,
    $loginSuccess,
    $loginError,
    loginFormSubmitted,
  ]);

  useEffect(() => {
    if (loginSuccess) {
      navigate("/learn");
    }
  }, [loginSuccess, navigate]);

  const handleSignUp = () => {
    navigate("/register");
  };

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const handleSubmit = (values: {
    username: string;
    password: string;
    rememberMe: boolean;
  }) => {
    // Call the login event with credentials
    login({
      username: values.username,
      password: values.password,
    });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Welcome back!
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account yet?{" "}
        <Anchor size="sm" component="button" onClick={handleSignUp}>
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {loginError && (
          <Alert color="red" mb="md" withCloseButton>
            {loginError}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Username"
              placeholder="Your username"
              {...form.getInputProps("username")}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps("password")}
            />

            <Group grow align="center" justify="space-between" mt="lg">
              <Checkbox
                label="Remember me"
                {...form.getInputProps("rememberMe", { type: "checkbox" })}
              />
              <Anchor size="sm">Forgot password?</Anchor>
            </Group>
          </Stack>

          <Button fullWidth mt="xl" type="submit" loading={loginPending}>
            Sign in
          </Button>

          <Divider label="Or continue with" labelPosition="center" my="lg" />

          <Group grow mb="md" mt="md">
            <Button variant="outline">Google</Button>
            <Button variant="outline">GitHub</Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};
