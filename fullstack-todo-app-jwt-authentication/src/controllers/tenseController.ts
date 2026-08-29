import { Request, Response } from "express";
import { TenseService } from "../services/tenseService";

export class TenseController {
  constructor(private readonly tenseService: TenseService) {}

  /** GET /api/tenses — toàn bộ Thì. */
  getTenses = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tenses = await this.tenseService.getAllTenses();
      res.json({ tenses });
    } catch (err) {
      res.status(500).json({ message: "Internal server error." });
    }
  };

  /** GET /api/tenses/:tenseId/levels — Level của một Thì kèm tiến độ. */
  getLevelsByTense = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const tenseId = Array.isArray(req.params.tenseId)
        ? req.params.tenseId[0]
        : req.params.tenseId;
      const levels = await this.tenseService.getLevelsByTense(userId, tenseId);
      res.json({ levels });
    } catch (err) {
      res.status(500).json({ message: "Internal server error." });
    }
  };
}
