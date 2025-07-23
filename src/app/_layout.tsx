import "../global.css";
import { Slot } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import ReportScreen from './report';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

export default function Layout() {
  // Removed splashVisible and related logic
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
