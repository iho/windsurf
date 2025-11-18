import { test, expect } from '@playwright/test';

test.describe('TodoMVC Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc/#/');
  });

  test('should load the TodoMVC application', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'What needs to be done?' })).toBeVisible();
    await expect(page.getByText('Double-click to edit a todo')).toBeVisible();
  });

  test('should add a new todo', async ({ page }) => {
    const todoText = 'Learn Playwright testing';
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todoText);
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    await expect(page.getByText(todoText)).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('should add multiple todos', async ({ page }) => {
    const todos = ['First todo', 'Second todo', 'Third todo'];
    
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    await expect(page.getByText('3 items left')).toBeVisible();
    
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible();
    }
  });

  test('should toggle todo completion', async ({ page }) => {
    const todoText = 'Complete this task';
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todoText);
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    // Mark todo as completed
    await page.getByLabel('Toggle Todo').click();
    await expect(page.getByText('0 items left')).toBeVisible();

    // Toggle back to active
    await page.getByLabel('Toggle Todo').click();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    const todoText = 'Todo to delete';
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todoText);
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    await expect(page.getByText(todoText)).toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();

    // Delete the todo (click the × button)
    await page.getByText(todoText).hover();
    await page.getByRole('listitem').filter({ hasText: todoText }).getByText('×').click();

    await expect(page.getByText(todoText)).not.toBeVisible();
    await expect(page.getByText('0 items left')).toBeVisible();
  });

  test('should filter todos - All', async ({ page }) => {
    const todos = ['Active todo', 'Completed todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Mark one as completed
    await page.getByLabel('Toggle Todo').first().click();

    // Click All filter
    await page.getByRole('link', { name: 'All' }).click();

    // Both todos should be visible
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible();
    }
  });

  test('should filter todos - Active', async ({ page }) => {
    const todos = ['Active todo', 'Completed todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Mark one as completed
    await page.getByLabel('Toggle Todo').first().click();

    // Click Active filter
    await page.getByRole('link', { name: 'Active' }).click();

    await expect(page.getByText('Active todo')).toBeVisible();
    await expect(page.getByText('Completed todo')).not.toBeVisible();
  });

  test('should filter todos - Completed', async ({ page }) => {
    const todos = ['Active todo', 'Completed todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Mark one as completed
    await page.getByLabel('Toggle Todo').first().click();

    // Click Completed filter
    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.getByText('Active todo')).not.toBeVisible();
    await expect(page.getByText('Completed todo')).toBeVisible();
  });

  test('should mark all todos as complete', async ({ page }) => {
    const todos = ['First todo', 'Second todo', 'Third todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Mark all as complete
    await page.getByLabel('Mark all as complete').click();

    await expect(page.getByText('0 items left')).toBeVisible();
    
    // Verify all checkboxes are checked
    const checkboxes = page.getByLabel('Toggle Todo');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('should clear completed todos', async ({ page }) => {
    const todos = ['Active todo', 'Completed todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Mark one as completed
    await page.getByLabel('Toggle Todo').first().click();

    // Clear completed
    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.getByText('Active todo')).toBeVisible();
    await expect(page.getByText('Completed todo')).not.toBeVisible();
    await expect(page.getByText('1 item left')).toBeVisible();
  });

  test('should edit a todo', async ({ page }) => {
    const originalTodo = 'Original todo text';
    const editedTodo = 'Edited todo text';
    
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(originalTodo);
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    // Double-click to edit
    await page.getByText(originalTodo).dblclick();
    
    // Edit the todo
    const todoInput = page.getByRole('textbox', { name: 'Edit todo' });
    await todoInput.fill(editedTodo);
    await todoInput.press('Enter');

    await expect(page.getByText(originalTodo)).not.toBeVisible();
    await expect(page.getByText(editedTodo)).toBeVisible();
  });

  test('should cancel todo edit with escape', async ({ page }) => {
    const originalTodo = 'Original todo text';
    const editedTodo = 'Edited todo text';
    
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(originalTodo);
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    // Double-click to edit
    await page.getByText(originalTodo).dblclick();
    
    // Edit the todo
    const todoInput = page.getByRole('textbox', { name: 'Edit todo' });
    await todoInput.fill(editedTodo);
    await todoInput.press('Escape');

    await expect(page.getByText(originalTodo)).toBeVisible();
    await expect(page.getByText(editedTodo)).not.toBeVisible();
  });

  test('should handle empty todo submission', async ({ page }) => {
    await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('');
    await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');

    // Should not create a todo
    await expect(page.getByText('0 items left')).toBeVisible();
    
    // Todo list should be empty
    const todoList = page.getByRole('list');
    await expect(todoList).toBeEmpty();
  });

  test('should persist todos across filter changes', async ({ page }) => {
    const todos = ['First todo', 'Second todo'];
    
    // Add todos
    for (const todo of todos) {
      await page.getByRole('textbox', { name: 'What needs to be done?' }).fill(todo);
      await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
    }

    // Navigate through filters
    await page.getByRole('link', { name: 'Active' }).click();
    await page.getByRole('link', { name: 'Completed' }).click();
    await page.getByRole('link', { name: 'All' }).click();

    // All todos should still be visible
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible();
    }
    await expect(page.getByText('2 items left')).toBeVisible();
  });
});
