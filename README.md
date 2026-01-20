# Interactive DOM Game

## Описание
Това е интерактивна браузърна игра, изцяло базирана на **DOM и JavaScript**.  
Играчът може да създава и управлява елементи (кубчета, кръгчета) чрез **мишка и клавиатура**.  
Играта включва **SAFE** и **DANGER** зони, различни точки за елементите и специално **keyboard challenge** предизвикателство.

## Как се играе
- Натисни **Start**, за да започне играта.
- Кликни върху shape, за да го избереш (active).
- Мести shape с **мишката** (drag & drop) или с **клавиатурата** (Arrow Keys или WASD).
- Различни цветове и точки:
  - **Червени кръгчета** → точки в DANGER, наказание в SAFE  
  - **Сини и жълти квадрати** → точки в SAFE, наказание в DANGER
- **Keyboard challenge**: появява се **веднъж на рунд** – тогава можеш да местиш shape **само с клавиатура**.

## Технологии
- HTML, CSS, Vanilla JavaScript
- DOM Events: click, dblclick, mousedown, mousemove, mouseup, keydown
- LocalStorage за High Score
