import * as React from "react";
import { Popup } from "../Popup";
import { ComponentMeta } from "@storybook/react";

export default {
  title: "Components/Popup",
  component: Popup,
} as ComponentMeta<typeof Popup>;

export const Render = () => <Popup />;
