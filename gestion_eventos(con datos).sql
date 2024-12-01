-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-11-2024 a las 23:05:34
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_eventos`
--
CREATE DATABASE IF NOT EXISTS `gestion_eventos` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `gestion_eventos`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistente`
--

CREATE TABLE `asistente` (
  `idAsistente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `domicilio` varchar(50) NOT NULL,
  `email` varchar(30) NOT NULL,
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistente`
--

INSERT INTO `asistente` (`idAsistente`, `nombre`, `domicilio`, `email`, `estado`) VALUES
(1, 'Federico Ivan Cruceño', 'B° Cerro de la Cruz M° 265 C° 10', 'fedeicru@gmail.com', 1),
(3, 'Jorge Ezequiel Diaz', 'Barrio Cerro de la Cruz Manzana 265 Casa 10', 'diazezequiel777@gmail.com', 1),
(4, 'Dora Nelida Orsomarso', 'Carranza 1129', 'doranel50@gmail.com', 1),
(5, 'Beatriz Hernando', 'La Cumparsita 494', 'beahernando.11@gmail.com', 1),
(6, 'Hugo Cruceño', 'Salta 616', 'hugocru23@gmail.com', 1),
(9, 'Miryam Jofre', 'Salta 616', 'miryjofre16@gmail.com', 1),
(10, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(11, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(12, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(13, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(14, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(15, 'Juan Perez', 'San Martin 123', 'jp123@gmail.com', 0),
(16, 'Juan Domingo Peron', 'Sarmiento 321', 'jdp321@gmail.com', 1),
(17, 'Juan Domingo Peron', 'Sarmiento 321', 'jdp321@gmail.com', 1),
(18, 'Juan Domingo Peron', 'Sarmiento 321', 'jdp321@gmail.com', 1),
(20, 'Juan Domingo Peron', 'Sarmiento 321', 'jdp321@gmail.com', 1),
(21, 'Federico Ivan Cruceño', 'Cerro de la Cruz M° 265 C° 10', 'fedeicru@gmail.com', 1),
(22, 'Luis Medina', 'Sarmiento 123', 'lm123@gmail.com', 1),
(23, 'Luis Medina', 'Sarmiento 123', 'lm123@gmail.com', 1),
(25, 'Beatriz Hernando', 'La Cumparsita 494', 'beahernando.11@gmail.com', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `idEvento` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `fecha` date NOT NULL,
  `ubicacion` varchar(50) NOT NULL,
  `descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `evento`
--

INSERT INTO `evento` (`idEvento`, `nombre`, `fecha`, `ubicacion`, `descripcion`) VALUES
(1, 'Confirmación', '2024-12-01', 'La Toma', 'La confirmación de mi hermano'),
(2, 'Comunión', '2024-10-03', 'San Luis', 'La comunión de mi ahijado'),
(5, 'Cumpleaños de Rocio', '2024-11-21', 'Villa Mercedes', 'El cumpleaños número 16 de Rocio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `participacion`
--

CREATE TABLE `participacion` (
  `idParticipacion` int(11) NOT NULL,
  `idAsistente` int(11) NOT NULL,
  `idEvento` int(11) NOT NULL,
  `confirmacion` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `participacion`
--

INSERT INTO `participacion` (`idParticipacion`, `idAsistente`, `idEvento`, `confirmacion`) VALUES
(1, 1, 1, 1),
(5, 4, 1, 0),
(7, 4, 2, 1),
(8, 3, 2, 0),
(10, 3, 5, 1),
(11, 5, 5, 1),
(15, 1, 2, 1),
(20, 25, 1, 0),
(22, 25, 2, 0);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asistente`
--
ALTER TABLE `asistente`
  ADD PRIMARY KEY (`idAsistente`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`idEvento`);

--
-- Indices de la tabla `participacion`
--
ALTER TABLE `participacion`
  ADD PRIMARY KEY (`idParticipacion`),
  ADD UNIQUE KEY `idAsistente` (`idAsistente`,`idEvento`),
  ADD KEY `idEvento` (`idEvento`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asistente`
--
ALTER TABLE `asistente`
  MODIFY `idAsistente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de la tabla `evento`
--
ALTER TABLE `evento`
  MODIFY `idEvento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `participacion`
--
ALTER TABLE `participacion`
  MODIFY `idParticipacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `participacion`
--
ALTER TABLE `participacion`
  ADD CONSTRAINT `participacion_ibfk_1` FOREIGN KEY (`idEvento`) REFERENCES `evento` (`idEvento`),
  ADD CONSTRAINT `participacion_ibfk_2` FOREIGN KEY (`idAsistente`) REFERENCES `asistente` (`idAsistente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
