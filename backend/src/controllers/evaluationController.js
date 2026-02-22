import * as evaluationService from '../services/evaluationService.js';

// @desc    Generate AI Evaluation (or return existing) for a startup
// @route   POST /api/v1/evaluations/generate
// @access  Private (Startup Owner or Admin)
export const generateEvaluation = async (req, res, next) => {
  const { startupId, description, budget, category, force } = req.body;

  if (!startupId) {
    return res.status(400).json({ message: 'startupId is required' });
  }

  try {
    const { evaluation, created } = await evaluationService.generateOrFetch(
      startupId,
      { description, budget, category, force: !!force }
    );
    res.status(created ? 201 : 200).json({ data: evaluation });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return next(new Error('AI returned an unexpected format. Please try again.'));
    }
    next(error);
  }
};

// @desc    Get Evaluation for a specific Startup
// @route   GET /api/v1/evaluations/:startupId
// @access  Private (Investor / Owner)
export const getEvaluation = async (req, res, next) => {
  try {
    const evaluation = await evaluationService.getByStartup(req.params.startupId);
    res.status(200).json({ data: evaluation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an Evaluation (admin only)
// @route   PUT /api/v1/evaluations/:startupId
// @access  Private (admin)
export const updateEvaluation = async (req, res, next) => {
  try {
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');
    if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });

    const evaluation = await evaluationService.updateByStartup(req.params.startupId, req.body);
    res.status(200).json({ data: evaluation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an Evaluation (admin only)
// @route   DELETE /api/v1/evaluations/:startupId
// @access  Private (admin)
export const deleteEvaluation = async (req, res, next) => {
  try {
    const isAdmin = Array.isArray(req.user.roles) && req.user.roles.includes('admin');
    if (!isAdmin) return res.status(403).json({ message: 'Forbidden' });

    await evaluationService.deleteByStartup(req.params.startupId);
    res.status(200).json({ message: 'Evaluation deleted' });
  } catch (error) {
    next(error);
  }
};

