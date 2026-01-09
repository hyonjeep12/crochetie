// localStorage 기반 데이터 관리
const RECIPES_KEY = 'crochet_recipes';
const PROJECTS_KEY = 'crochet_projects';

// Recipe 관리
export const getRecipes = () => {
  const stored = localStorage.getItem(RECIPES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveRecipe = (recipe) => {
  const recipes = getRecipes();
  if (recipe.id) {
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index >= 0) {
      recipes[index] = recipe;
    } else {
      recipes.push(recipe);
    }
  } else {
    // 새 레시피인 경우에만 ID 생성
    recipe.id = Date.now().toString();
    recipes.push(recipe);
  }
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  return recipe;
};

export const deleteRecipe = (id) => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
};

// MyProject 관리
export const getProjects = () => {
  const stored = localStorage.getItem(PROJECTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProject = (project) => {
  const projects = getProjects();
  if (project.id) {
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
  } else {
    project.id = Date.now().toString();
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  return project;
};

export const deleteProject = (id) => {
  const projects = getProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getProjectByRecipeId = (recipeId) => {
  return getProjects().find(p => p.recipe_id === recipeId);
};
