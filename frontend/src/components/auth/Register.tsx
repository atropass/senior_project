import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Container } from "@mantine/core";
import { useEffect } from "react";
import { useUnit } from "effector-react";
import {
  registerFormSubmitted,
  $registerPending,
  $registerSuccess,
} from "../../features/auth/register";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [registerPending, registerSuccess, register] = useUnit([
    $registerPending,
    $registerSuccess,
    registerFormSubmitted,
  ]);

  useEffect(() => {
    if (registerSuccess) {
      navigate("/login");
    }
  }, [registerSuccess, navigate]);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validate: {
      username: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must include at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords did not match" : null,
      terms: (value) => (value ? null : "You must accept terms and conditions"),
    },
  });

  const handleSubmit = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
  }) => {
    register({
      username: values.username,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className="font-bold">
        Create your account
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{" "}
        <Anchor size="sm" component="button" onClick={handleLoginClick}>
          Log in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="Name"
              placeholder="Your username"
              {...form.getInputProps("username")}
            />

            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              {...form.getInputProps("email")}
            />

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps("password")}
            />

            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm your password"
              {...form.getInputProps("confirmPassword")}
            />

            <Checkbox
              label="I accept terms and conditions"
              {...form.getInputProps("terms", { type: "checkbox" })}
            />
          </Stack>

          <Button fullWidth mt="xl" type="submit" loading={registerPending}>
            Register
          </Button>
        </form>
      </Paper>
    </Container>
  );
};
